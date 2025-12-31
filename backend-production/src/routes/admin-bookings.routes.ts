import express from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { createActivityLog } from '../utils/utils/activityLogger';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all bookings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, requestType } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (requestType) {
      where.requestType = requestType;
    }

    const bookings = await prisma.bookingRequest.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            courseType: true,
          },
        },
        trainer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            userName: true,
            companyEmail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// Get conflicting bookings (APPROVED but not CONFIRMED on same date)
router.get('/:id/conflicting', async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!booking || !booking.trainerId || !booking.requestedDate) {
      return res.json({ conflictingBookings: [] });
    }

    // Get bookings on the same date that are APPROVED but not CONFIRMED
    const conflictingBookings = await prisma.bookingRequest.findMany({
      where: {
        trainerId: booking.trainerId,
        requestedDate: booking.requestedDate,
        status: 'APPROVED',
        id: { not: booking.id }, // Exclude current booking
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            userName: true,
            companyEmail: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Show older bookings first
    });

    return res.json({ conflictingBookings });
  } catch (error: any) {
    console.error('Get conflicting bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch conflicting bookings', details: error.message });
  }
});

// Send email to multiple clients
router.post('/send-email', async (req: AuthRequest, res) => {
  try {
    const { clientIds, title, message } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0 || !title || !message) {
      return res.status(400).json({ error: 'clientIds (array), title, and message are required' });
    }

    // Create notifications for all clients
    const notifications = await Promise.all(
      clientIds.map((clientId: string) =>
        prisma.notification.create({
          data: {
            userId: clientId,
            title,
            message,
            type: 'INFO',
            relatedEntityType: 'booking_request',
          },
        }).catch(() => null) // Ignore errors for individual notifications
      )
    );

    await createActivityLog({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'booking_request',
      description: `Sent email to ${clientIds.length} client(s)`,
      metadata: { title, clientCount: clientIds.length },
    });

    return res.json({ 
      message: `Email sent to ${notifications.filter(n => n !== null).length} client(s)`,
      sentCount: notifications.filter(n => n !== null).length,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Confirm booking
router.put('/:id/confirm', async (req: AuthRequest, res) => {
  try {
    const { totalSlots, registeredParticipants, eventDate, availabilityId } = req.body;
    // totalSlots: Total number of people who can attend (sets maxPacks for the event)
    // registeredParticipants: Number of people registered now through this request (creates registrations)
    // eventDate: Required for Public bookings, optional for In-House (uses requestedDate if not provided)
    // availabilityId: Required - Trainer availability ID to use for the event date (standardized)

    if (!totalSlots || parseInt(String(totalSlots)) < 1) {
      return res.status(400).json({ error: 'Total slots is required and must be at least 1' });
    }

    if (!registeredParticipants || parseInt(String(registeredParticipants)) < 1) {
      return res.status(400).json({ error: 'Registered participants is required and must be at least 1' });
    }

    if (!availabilityId) {
      return res.status(400).json({ error: 'Trainer availability ID is required. Please select a date from trainer availability calendar.' });
    }

    const totalSlotsNum = parseInt(String(totalSlots));
    const registeredParticipantsNum = parseInt(String(registeredParticipants));

    if (registeredParticipantsNum > totalSlotsNum) {
      return res.status(400).json({ error: 'Registered participants cannot exceed total slots' });
    }

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
      include: {
        course: true,
        trainer: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.courseId) {
      return res.status(400).json({ error: 'Booking must have an associated course' });
    }

    if (!booking.trainerId) {
      return res.status(400).json({ error: 'Booking must have an assigned trainer' });
    }

    // Standardized: Use trainer availability to get the event date
    const availability = await prisma.trainerAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      return res.status(404).json({ error: 'Trainer availability not found' });
    }

    // Verify availability belongs to the booking's trainer
    if (availability.trainerId !== booking.trainerId) {
      return res.status(400).json({ error: 'Trainer availability does not belong to the assigned trainer' });
    }

    // Verify availability is available (unless already booked by this booking)
    if (availability.status !== 'AVAILABLE' && availability.status !== 'TENTATIVE') {
      return res.status(400).json({ error: `Selected date is not available. Current status: ${availability.status}` });
    }

    // Get event date from availability (standardized - always use availability date)
    const finalEventDate = new Date(availability.date);

    // For PUBLIC bookings, also validate eventDate matches availability date if provided
    if (booking.requestType === 'PUBLIC' && eventDate) {
      const providedDate = new Date(eventDate);
      const availabilityDate = new Date(availability.date);
      // Compare dates (ignore time)
      if (providedDate.toDateString() !== availabilityDate.toDateString()) {
        return res.status(400).json({ error: 'Provided event date does not match selected trainer availability date' });
      }
    }

    const course = booking.course;
    if (!course) {
      return res.status(400).json({ error: 'Booking must have an associated course' });
    }

    // Calculate number of days to block based on course duration
    const calculateDaysToBlock = (durationHours: number | null, durationUnit: string | null): number => {
      if (!durationHours || durationHours <= 0) return 1; // Default to 1 day if no duration
      
      const unit = (durationUnit || 'hours').toLowerCase();
      
      if (unit === 'days') {
        return Math.ceil(durationHours); // If already in days, use as-is
      } else if (unit === 'half_day') {
        return Math.ceil(durationHours * 0.5); // Half day = 0.5 days
      } else {
        // Default: hours - assume 8 hours per day
        return Math.ceil(durationHours / 8); // Convert hours to days (8 hours = 1 day)
      }
    };

    const daysToBlock = calculateDaysToBlock(course.durationHours, course.durationUnit);

    // Standardized: Check for duplicate events before creating
    const existingEvent = await prisma.event.findFirst({
      where: {
        courseId: course.id,
        eventDate: finalEventDate,
      },
    });

    if (existingEvent) {
      return res.status(400).json({ error: 'Event already exists for this course and date' });
    }

    // Update booking status and store availability ID
    const updated = await prisma.bookingRequest.update({
      where: { id: req.params.id },
      data: { 
        status: 'CONFIRMED',
        trainerAvailabilityId: availabilityId, // Store availability ID for tracking
      },
    });

    // Block multiple days based on course duration
    try {
      const datesToBlock: Date[] = [];
      for (let i = 0; i < daysToBlock; i++) {
        const blockDate = new Date(finalEventDate);
        blockDate.setDate(blockDate.getDate() + i);
        datesToBlock.push(blockDate);
      }

      // Update all availability records for the duration period
      for (const blockDate of datesToBlock) {
        // Find availability record for this date
        const availabilityRecord = await prisma.trainerAvailability.findFirst({
          where: {
            trainerId: booking.trainerId!,
            date: blockDate,
          },
        });

        if (availabilityRecord) {
          // Update existing availability to BOOKED
          await prisma.trainerAvailability.update({
            where: { id: availabilityRecord.id },
            data: { status: 'BOOKED' },
          });
        } else {
          // Create new availability record as BOOKED if it doesn't exist
          await prisma.trainerAvailability.create({
            data: {
              trainerId: booking.trainerId!,
              date: blockDate,
              status: 'BOOKED',
            },
          });
        }
      }

      console.log(`[Booking Confirmation] Blocked ${daysToBlock} day(s) for trainer ${booking.trainerId} starting from ${finalEventDate.toISOString().split('T')[0]}`);
    } catch (error: any) {
      console.error('Error updating trainer availability status:', error);
      // Continue even if update fails, but log error
    }

    // Create Event from the confirmed booking
    if (course) {
      const startDate = finalEventDate;
      // Calculate end date based on duration (use booking.endDate if provided, otherwise calculate from duration)
      let endDate = booking.endDate ? new Date(booking.endDate) : null;
      if (!endDate && daysToBlock > 1) {
        endDate = new Date(finalEventDate);
        endDate.setDate(endDate.getDate() + (daysToBlock - 1)); // Subtract 1 because start date counts as day 1
      }

      // Generate event code
      const eventCode = `EVT-${Date.now().toString(36).toUpperCase()}`;

      // Standardized: Handle courseMode as array (consistent with course event creation)
      let courseModeArray: string[] = [];
      if (course.courseMode) {
        if (Array.isArray(course.courseMode)) {
          courseModeArray = course.courseMode as string[];
        } else if (typeof course.courseMode === 'string') {
          try {
            const parsed = JSON.parse(course.courseMode);
            courseModeArray = Array.isArray(parsed) ? (parsed as string[]) : [parsed as string];
          } catch {
            courseModeArray = [course.courseMode];
          }
        } else {
          courseModeArray = [String(course.courseMode)];
        }
      }
      // Default to PHYSICAL if no mode specified
      if (courseModeArray.length === 0) {
        courseModeArray = ['PHYSICAL'];
      }

      // For both In-House and Public: totalSlots sets maxPacks
      // For In-House: maxPacks can be set to totalSlots (capacity), but registrations are still created
      // For Public: maxPacks = totalSlots (available slots for registration)
      const event = await prisma.event.create({
        data: {
          courseId: course.id,
          trainerId: booking.trainerId || null,
          createdBy: req.user!.id,
          eventCode: eventCode,
          title: course.title || `Event: ${course.title}`,
          description: course.description || null,
          learningObjectives: course.learningObjectives ?? undefined,
          learningOutcomes: course.learningOutcomes ?? undefined,
          targetAudience: course.targetAudience || null,
          methodology: course.methodology || null,
          prerequisite: course.prerequisite || null,
          certificate: course.certificate || null,
          assessment: course.assessment || false,
          courseType: booking.requestType === 'PUBLIC' ? ['PUBLIC'] : ['IN_HOUSE'], // Standardized: Store as array
          courseMode: courseModeArray, // Standardized: Always use array format
          durationHours: course.durationHours || 0,
          durationUnit: course.durationUnit || 'hours',
          modules: course.modules || [],
          venue: booking.location || course.venue || null,
          price: course.price || null,
          eventDate: finalEventDate, // Standardized: Always use date from availability
          startDate: startDate,
          endDate: endDate,
          category: course.category || null,
          city: booking.city || course.city || null,
          state: booking.state || course.state || null,
          hrdcClaimable: course.hrdcClaimable || false,
          courseSequence: course.courseSequence || null,
          status: 'ACTIVE',
          // For both types: maxPacks = totalSlots (total capacity)
          maxPacks: totalSlotsNum,
        },
      });

      // For both In-House and Public: Create a single registration with number of participants
      // Since admin already confirmed these participants during booking confirmation,
      // they should be created as APPROVED (no need for admin to approve again)
      if (registeredParticipantsNum > 0 && booking.clientId) {
        // Create a single registration with the number of participants
        // Use 'APPROVED' status since admin already confirmed them during booking confirmation
        await prisma.eventRegistration.create({
          data: {
            eventId: event.id,
            clientId: booking.clientId,
            clientName: booking.clientName || null,
            clientEmail: booking.clientEmail || null,
            numberOfParticipants: registeredParticipantsNum,
            status: 'APPROVED', // Already approved by admin during booking confirmation
          },
        });
        // Note: maxPacks is set to totalSlotsNum
        // The registeredParticipantsNum participants consume that many slots
        // Available slots = totalSlotsNum - registeredParticipantsNum
        // For Public: Other clients can register for remaining slots
        // For In-House: Remaining slots may be used for additional participants from the same company
      }

      // Create notification
      if (booking.clientId) {
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            title: 'Booking Confirmed',
            message: `Booking for ${booking.requestedDate} has been confirmed and an event has been created.`,
            type: 'SUCCESS',
            relatedEntityType: 'booking',
            relatedEntityId: booking.id,
          },
        });
      }

      await createActivityLog({
        userId: req.user!.id,
        actionType: 'CONFIRM',
        entityType: 'booking',
        entityId: booking.id,
        description: `Confirmed booking for ${booking.clientName} and created event ${eventCode}`,
        metadata: { eventId: event.id, totalSlots: totalSlotsNum, registeredParticipants: registeredParticipantsNum },
      });

      return res.json({ 
        message: 'Booking confirmed successfully and event created', 
        booking: updated,
        event,
      });
    } else {
      // Fallback if no course (shouldn't happen but handle gracefully)
      if (booking.clientId) {
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            title: 'Booking Confirmed',
            message: `Booking for ${booking.requestedDate} has been confirmed.`,
            type: 'SUCCESS',
            relatedEntityType: 'booking',
            relatedEntityId: booking.id,
          },
        });
      }

      await createActivityLog({
        userId: req.user!.id,
        actionType: 'CONFIRM',
        entityType: 'booking',
        entityId: booking.id,
        description: `Confirmed booking for ${booking.clientName}`,
      });

      return res.json({ message: 'Booking confirmed successfully', booking: updated });
    }
  } catch (error: any) {
    console.error('Confirm booking error:', error);
    return res.status(500).json({ error: 'Failed to confirm booking', details: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = await prisma.bookingRequest.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    // Create notification
    if (booking.clientId) {
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Booking Cancelled',
          message: 'A booking has been cancelled.',
          type: 'WARNING',
          relatedEntityType: 'booking',
          relatedEntityId: booking.id,
        },
      });
    }

    await createActivityLog({
      userId: req.user!.id,
      actionType: 'CANCEL',
      entityType: 'booking',
      entityId: booking.id,
      description: `Cancelled booking for ${booking.clientName}`,
    });

    return res.json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
  }
});

export default router;

