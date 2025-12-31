import { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { Course } from '../lib/api-client';
import { auth } from '../lib/auth';
import { apiClient } from '../lib/api-client';

type EventRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
};

export function EventRegistrationModal({
  isOpen,
  onClose,
  course,
}: EventRegistrationModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<Array<{ 
    id: string; 
    eventDate: string; // ISO string format (YYYY-MM-DD)
    eventDateObj: Date; // Original Date object for display
    title: string;
    venue?: string | null;
    courseMode?: any;
    city?: string | null;
    state?: string | null;
  }>>([]);
  const [selectedEventDate, setSelectedEventDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<typeof availableEvents[0] | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAvailableEvents([]);
      setSelectedEvent(null);
      setSelectedEventDate('');
      setEventId(null);
      setSubmitMessage(null);
      setLoadingEvent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && course) {
      const fetchData = async () => {
        try {
          // Reset state when fetching new data
          setAvailableEvents([]);
          setSelectedEvent(null);
          setSelectedEventDate('');
          setEventId(null);
          setSubmitMessage(null);
          
          // Find all events for this course
          setLoadingEvent(true);
          console.log('[EventRegistrationModal] Fetching events for course:', course.id);
          const eventsResponse = await apiClient.getEvents({ courseId: course.id });
          const events = eventsResponse.events || [];
          
          console.log('[EventRegistrationModal] Raw events from API:', events);
          console.log('[EventRegistrationModal] Events response structure:', eventsResponse);
          
          // Filter only future events and sort by date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Normalize event dates to ISO string format (YYYY-MM-DD) for consistent comparison
          console.log('[EventRegistrationModal] Filtering events. Today:', today.toISOString());
          const futureEvents = events
            .filter((e: any) => {
              const rawDate = e.eventDate || e.event_date;
              console.log('[EventRegistrationModal] Processing event:', { id: e.id, rawDate, venue: e.venue, courseMode: e.courseMode });
              const eventDate = new Date(rawDate);
              if (isNaN(eventDate.getTime())) {
                console.warn('[EventRegistrationModal] Invalid event date:', rawDate);
                return false;
              }
              eventDate.setHours(0, 0, 0, 0);
              const isFuture = eventDate >= today;
              console.log('[EventRegistrationModal] Event date check:', { 
                eventDate: eventDate.toISOString(), 
                today: today.toISOString(), 
                isFuture 
              });
              return isFuture;
            })
            .map((e: any) => {
              // Normalize eventDate to ISO string format (YYYY-MM-DD)
              const eventDateObj = new Date(e.eventDate || e.event_date);
              const eventDateStr = eventDateObj.toISOString().split('T')[0];
              
              return {
                id: e.id,
                eventDate: eventDateStr, // Store as YYYY-MM-DD string for consistent comparison
                eventDateObj: eventDateObj, // Keep original Date object for display
                title: e.title || course.title,
                venue: e.venue || null,
                courseMode: e.courseMode || e.course_mode || null,
                city: e.city || null,
                state: e.state || null,
              };
            })
            .sort((a: any, b: any) => a.eventDateObj.getTime() - b.eventDateObj.getTime());

          setAvailableEvents(futureEvents);
          
          console.log('[EventRegistrationModal] Processed future events:', futureEvents);

          // If multiple events, let user choose; if single event, auto-select; if no events but has fixed_date, allow registration
          if (futureEvents.length === 1) {
            console.log('[EventRegistrationModal] Single event detected, auto-selecting:', futureEvents[0]);
            setEventId(futureEvents[0].id);
            setSelectedEventDate(futureEvents[0].eventDate);
            setSelectedEvent(futureEvents[0]);
          } else if (futureEvents.length > 1) {
            console.log('[EventRegistrationModal] Multiple events detected, waiting for user selection');
            // User will select from dropdown - don't auto-select, let them choose
            setEventId(null);
            setSelectedEventDate('');
            setSelectedEvent(null);
          } else if (course.fixed_date) {
            // Course has fixed_date but no event yet - backend will create event during registration
            const fixedDateStr = new Date(course.fixed_date).toISOString().split('T')[0];
            setEventId(null);
            setSelectedEventDate(fixedDateStr);
            setSelectedEvent(null);
          } else {
            setSubmitMessage({
              type: 'error',
              text: 'No available events found for this course. Please contact support.',
            });
          }

          // Fetch user data
          const { user } = await auth.getSession();
          if (user) {
            const userName = user.fullName || user.email?.split('@')[0] || '';
            const userEmail = user.email || '';
            setFormData({
              clientName: userName,
              clientEmail: userEmail,
            });
          }
        } catch (error) {
          console.error('[EventRegistrationModal] Error fetching data:', error);
          setSubmitMessage({
            type: 'error',
            text: 'Failed to load event information',
          });
        } finally {
          setIsLoadingUser(false);
          setLoadingEvent(false);
        }
      };
      fetchData();
    }
  }, [isOpen, course]);

  // Sync selectedEvent when selectedEventDate changes (e.g., from dropdown selection)
  useEffect(() => {
    if (selectedEventDate && availableEvents.length > 0) {
      const foundEvent = availableEvents.find(ev => ev.eventDate === selectedEventDate);
      if (foundEvent && (!selectedEvent || selectedEvent.id !== foundEvent.id)) {
        console.log('[EventRegistrationModal] Syncing selectedEvent from selectedEventDate:', foundEvent);
        setSelectedEvent(foundEvent);
        setEventId(foundEvent.id);
      }
    } else if (!selectedEventDate && selectedEvent) {
      // Clear selectedEvent if selectedEventDate is cleared
      setSelectedEvent(null);
      setEventId(null);
    }
  }, [selectedEventDate, availableEvents]);

  if (!isOpen || !course) return null;

  // Debug: Log current state when modal is open
  console.log('[EventRegistrationModal] Render state:', {
    isOpen,
    loadingEvent,
    availableEventsCount: availableEvents.length,
    selectedEventDate,
    selectedEvent: selectedEvent ? { id: selectedEvent.id, venue: selectedEvent.venue, courseMode: selectedEvent.courseMode } : null,
    eventId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const { user } = await auth.getSession();
      if (!user) {
        setSubmitMessage({
          type: 'error',
          text: 'You must be logged in to register for this event.',
        });
        setIsSubmitting(false);
        return;
      }

      if (!eventId && !course.id) {
        setSubmitMessage({
          type: 'error',
          text: 'Event not found. Please contact support.',
        });
        setIsSubmitting(false);
        return;
      }

      await apiClient.registerForEvent(eventId, course.id, {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
      });

      setSubmitMessage({
        type: 'success',
        text: 'You have successfully registered for this event! You will receive a confirmation email shortly.',
      });

      setTimeout(() => {
        onClose();
        setFormData({ clientName: '', clientEmail: '' });
        setSubmitMessage(null);
      }, 3000);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to register for event',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fixedDate = course.fixed_date ? new Date(course.fixed_date) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Register for Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loadingEvent ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading event information...</p>
            </div>
          ) : (
            <>
              {/* Course Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
              </div>

              {/* Event Date Selection */}
              {availableEvents.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {availableEvents.length > 1 ? 'Select Event Date *' : 'Event Date'}
                  </label>
                  <select
                    value={selectedEventDate}
                    onChange={(e) => {
                      const selectedDateValue = e.target.value;
                      const selected = availableEvents.find(ev => ev.eventDate === selectedDateValue);
                      console.log('[EventRegistrationModal] Dropdown onChange - Selected date value:', selectedDateValue);
                      console.log('[EventRegistrationModal] Found event:', selected);
                      console.log('[EventRegistrationModal] Available events:', availableEvents);
                      
                      setSelectedEventDate(selectedDateValue);
                      setEventId(selected?.id || null);
                      setSelectedEvent(selected || null);
                    }}
                    required={availableEvents.length > 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableEvents.length > 1 && <option value="">Choose a date...</option>}
                    {availableEvents.map((event) => (
                      <option key={event.id} value={event.eventDate}>
                        {event.eventDateObj.toLocaleDateString('en-MY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              ) : fixedDate ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {fixedDate.toLocaleDateString('en-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Venue Field */}
              {selectedEvent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedEvent.venue ? (
                      <p className="text-gray-700">
                        {selectedEvent.venue}
                        {selectedEvent.city && selectedEvent.state && (
                          <span className="text-gray-500">, {selectedEvent.city}, {selectedEvent.state}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">To be confirmed</p>
                    )}
                  </div>
                </div>
              ) : availableEvents.length > 0 && !selectedEvent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-400 italic">
                      {availableEvents.length > 1 ? 'Select a date to view venue' : 'Loading...'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Mode Field */}
              {selectedEvent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedEvent.courseMode ? (() => {
                      // Handle courseMode which can be JSON array, string, or already parsed
                      let modes: string[] = [];
                      try {
                        if (Array.isArray(selectedEvent.courseMode)) {
                          modes = selectedEvent.courseMode;
                        } else if (typeof selectedEvent.courseMode === 'string') {
                          const parsed = JSON.parse(selectedEvent.courseMode);
                          modes = Array.isArray(parsed) ? parsed : [parsed];
                        } else if (selectedEvent.courseMode) {
                          modes = [selectedEvent.courseMode];
                        }
                      } catch {
                        modes = typeof selectedEvent.courseMode === 'string' 
                          ? [selectedEvent.courseMode] 
                          : [];
                      }
                      
                      if (modes.length > 0) {
                        const modeLabels: { [key: string]: string } = {
                          'PHYSICAL': 'Physical',
                          'ONLINE': 'Online',
                          'HYBRID': 'Hybrid',
                        };
                        return (
                          <p className="text-gray-700">
                            {modes.map(m => modeLabels[String(m).toUpperCase()] || m).join(', ')}
                          </p>
                        );
                      }
                      return <p className="text-gray-400 italic">To be confirmed</p>;
                    })() : (
                      <p className="text-gray-400 italic">To be confirmed</p>
                    )}
                  </div>
                </div>
              ) : availableEvents.length > 0 && !selectedEvent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-400 italic">
                      {availableEvents.length > 1 ? 'Select a date to view mode' : 'Loading...'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting || isLoadingUser}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting || isLoadingUser}
                />
              </div>

              {submitMessage && (
                <div
                  className={`p-3 rounded-lg ${
                    submitMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {submitMessage.type === 'success' && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <p className="text-sm">{submitMessage.text}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || (availableEvents.length > 0 && !eventId) || isLoadingUser}
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

