import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { apiClient } from '../../lib/api-client';
import { showToast } from '../common/Toast';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface TrainerCalendarViewProps {
  trainerId: string;
  trainerName: string;
  onClose: () => void;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  status: 'available' | 'not_available' | 'blocked' | 'tentative' | 'booked';
  bookings: any[];
}

const SHORT_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isToday(date: Date): boolean {
  return formatDate(date) === formatDate(new Date());
}

function getCalendarGrid(year: number, month: number): Date[] {
  const lastDay = new Date(year, month + 1, 0);
  const grid: Date[] = [];
  for (let day = 1; day <= lastDay.getDate(); day++) {
    grid.push(new Date(year, month, day));
  }
  return grid;
}

function getMonthName(month: number): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleString('default', { month: 'long' });
}

function getStatusBorderColor(status: CalendarDay['status']): string {
  switch (status) {
    case 'available':
      return 'border-green-500';
    case 'not_available':
      return 'border-gray-400';
    case 'blocked':
      return 'border-red-500';
    case 'tentative':
      return 'border-yellow-500';
    case 'booked':
      return 'border-orange-500';
    default:
      return 'border-gray-200';
  }
}

function resolveDayStatus(
  bookings: any[],
  availability: any | null,
  isBlocked: boolean
): CalendarDay['status'] {
  if (isBlocked) return 'blocked';

  // Check for confirmed/booked bookings first
  const bookedBookings = bookings.filter((b) => {
    const status = (b.status || '').toLowerCase();
    return status === 'booked' || status === 'confirmed';
  });
  if (bookedBookings.length > 0) return 'booked';

  // Check for tentative bookings
  const tentativeBookings = bookings.filter((b) => {
    const status = (b.status || '').toLowerCase();
    return status === 'approved' || status === 'tentative';
  });
  if (tentativeBookings.length > 0) return 'tentative';

  // Check availability record
  if (availability) {
    const availabilityStatus = (availability.status || '').toLowerCase();
    if (availabilityStatus === 'not_available') return 'not_available';
    if (availabilityStatus === 'available') return 'available';
    if (availabilityStatus === 'booked') return 'booked';
    if (availabilityStatus === 'tentative') return 'tentative';
  }

  return 'not_available';
}

function getBookingsForDate(bookings: any[], date: Date): any[] {
  const dateString = formatDate(date);
  return bookings.filter((booking) => {
    if (!booking.requested_date) return false;
    const bookingStartDate = booking.requested_date.split('T')[0];
    if (booking.end_date) {
      const bookingEndDate = booking.end_date.split('T')[0];
      return dateString >= bookingStartDate && dateString <= bookingEndDate;
    }
    return bookingStartDate === dateString;
  });
}

export const TrainerCalendarView: React.FC<TrainerCalendarViewProps> = ({
  trainerId,
  trainerName,
  onClose,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [blockedWeekdays, setBlockedWeekdays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateAvailability, setShowCreateAvailability] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'NOT_AVAILABLE',
  });
  const [creatingAvailability, setCreatingAvailability] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startDate = useMemo(() => new Date(year, month, 1), [year, month]);
  const endDate = useMemo(() => new Date(year, month + 1, 0), [year, month]);

  useEffect(() => {
    fetchCalendarData();
  }, [trainerId, startDate, endDate]);

  const fetchCalendarData = async () => {
    if (!trainerId) return;

    setLoading(true);
    setError(null);

    try {
      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);

      // Fetch bookings
      const bookingResponse = await apiClient.get<{ bookingRequests: any[] }>('/bookings');
      const allBookings = bookingResponse.bookingRequests || [];
      const filteredBookings = allBookings
        .filter((b: any) => b.trainer_id === trainerId || b.trainerId === trainerId)
        .map((booking: any) => ({
          ...booking,
          requested_date: booking.requested_date || booking.requestedDate,
          end_date: booking.end_date || booking.endDate,
          status: (booking.status || '').toLowerCase(),
        }))
        .filter((b: any) => {
          if (!b.requested_date) return false;
          const dStr = b.requested_date.split('T')[0];
          return dStr >= startStr && dStr <= endStr;
        });

      // Fetch events
      const eventsResponse = await apiClient.getEvents({ trainerId, status: 'ACTIVE' });
      const allEvents = (eventsResponse?.events || []) as any[];
      const eventBookings = allEvents
        .map((event: any) => {
          let eventDate = event.eventDate || event.event_date || null;
          let endDate = event.endDate || event.end_date || null;
          
          if (eventDate && typeof eventDate !== 'string') {
            eventDate = formatDate(new Date(eventDate));
          } else if (eventDate && typeof eventDate === 'string' && eventDate.includes('T')) {
            eventDate = eventDate.split('T')[0];
          }
          
          if (endDate && typeof endDate !== 'string') {
            endDate = formatDate(new Date(endDate));
          } else if (endDate && typeof endDate === 'string' && endDate.includes('T')) {
            endDate = endDate.split('T')[0];
          }

          return {
            id: event.id,
            requested_date: eventDate,
            end_date: endDate,
            status: 'confirmed',
            courses: {
              title: event.title || event.course?.title || 'Event',
            },
          };
        })
        .filter((b: any) => {
          if (!b.requested_date) return false;
          const dStr = b.requested_date.split('T')[0];
          if (dStr >= startStr && dStr <= endStr) return true;
          if (b.end_date) {
            const endStr2 = b.end_date.split('T')[0];
            return endStr2 >= startStr && endStr2 <= endStr;
          }
          return false;
        });

      const allCalendarBookings = [...filteredBookings, ...eventBookings];

      // Fetch availability
      const availabilityResponse = await apiClient.getTrainerAvailability(trainerId, {
        startDate: startStr,
        endDate: endStr,
      });
      const availabilityArray = Array.isArray(availabilityResponse)
        ? availabilityResponse
        : (availabilityResponse as any)?.availability || [];
      const normalizedAvailability = availabilityArray.map((item: any) => ({
        id: item.id,
        date: (item.date || item.dateString || '').split('T')[0] || item.date,
        status: (item.status || 'AVAILABLE').toString().toLowerCase(),
      }));

      // Fetch blocked weekdays
      let blockedDays: number[] = [];
      try {
        const blockedResponse = await apiClient.getTrainerBlockedDays(trainerId);
        blockedDays = blockedResponse.blockedDays || [];
      } catch (err) {
        // If endpoint doesn't exist or fails, continue without blocked days
        console.warn('Could not fetch blocked days:', err);
      }

      setBookings(allCalendarBookings);
      setAvailabilities(normalizedAvailability);
      setBlockedWeekdays(blockedDays);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const calendarDates = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const calendarDays = useMemo(() => {
    return calendarDates.map((date) => {
      const dateString = formatDate(date);
      const dayBookings = getBookingsForDate(bookings, date);
      const availability = availabilities.find((a) => a.date === dateString) || null;
      const dayOfWeek = date.getDay();
      const isBlocked = blockedWeekdays.includes(dayOfWeek);

      return {
        date,
        dateString,
        status: resolveDayStatus(dayBookings, availability, isBlocked),
        bookings: dayBookings,
      };
    });
  }, [calendarDates, bookings, availabilities, blockedWeekdays]);

  const filterCounts = useMemo(() => {
    const counts = {
      all: calendarDays.length,
      booked: 0,
      blocked: 0,
      available: 0,
      not_available: 0,
      tentative: 0,
    };

    calendarDays.forEach((day) => {
      if (day.status === 'booked') counts.booked++;
      else if (day.status === 'blocked') counts.blocked++;
      else if (day.status === 'available') counts.available++;
      else if (day.status === 'not_available') counts.not_available++;
      else if (day.status === 'tentative') counts.tentative++;
    });

    return counts;
  }, [calendarDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateAvailability = async () => {
    if (!availabilityForm.startDate || !availabilityForm.endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    try {
      const dates: string[] = [];
      const start = new Date(availabilityForm.startDate);
      const end = new Date(availabilityForm.endDate);
      
      if (end < start) {
        showToast('End date must be after start date', 'error');
        return;
      }

      const current = new Date(start);
      while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
      }

      setCreatingAvailability(true);
      await apiClient.createTrainerAvailability(trainerId, {
        dates,
        status: availabilityForm.status,
      });
      
      showToast(`Availability created successfully for ${dates.length} date(s)`, 'success');
      setShowCreateAvailability(false);
      setAvailabilityForm({ startDate: '', endDate: '', status: 'AVAILABLE' });
      
      // Refresh calendar data
      await fetchCalendarData();
    } catch (error: any) {
      showToast(error.message || 'Error creating availability', 'error');
    } finally {
      setCreatingAvailability(false);
    }
  };

  const firstDay = calendarDays.length > 0 ? calendarDays[0].date.getDay() : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Calendar</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchCalendarData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar - {trainerName}</h2>
          <p className="text-gray-600 mt-1">View trainer's availability and bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateAvailability(!showCreateAvailability)}
          >
            <Plus size={18} className="mr-2" />
            {showCreateAvailability ? 'Cancel' : 'Create Availability'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Create Availability Form */}
      {showCreateAvailability && (
        <Card>
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Create Availability</h3>
            <button
              onClick={() => setShowCreateAvailability(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date *"
                  type="date"
                  value={availabilityForm.startDate}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, startDate: e.target.value })}
                  required
                />
                <Input
                  label="End Date *"
                  type="date"
                  value={availabilityForm.endDate}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, endDate: e.target.value })}
                  required
                  min={availabilityForm.startDate}
                />
              </div>
              <Select
                label="Status *"
                value={availabilityForm.status}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, status: e.target.value as 'AVAILABLE' | 'NOT_AVAILABLE' })}
                options={[
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'NOT_AVAILABLE', label: 'Not Available' },
                ]}
              />
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>This will create availability records for all dates from start date to end date (inclusive).</p>
                <p className="mt-1">If a date already has an availability record, it will be updated to the selected status.</p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateAvailability(false);
                    setAvailabilityForm({ startDate: '', endDate: '', status: 'AVAILABLE' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateAvailability}
                  disabled={!availabilityForm.startDate || !availabilityForm.endDate || creatingAvailability}
                >
                  {creatingAvailability ? 'Creating...' : 'Create Availability'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">
            {getMonthName(month)} {year}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={goToToday}>
              Today
            </Button>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {SHORT_WEEKDAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for alignment */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-24" />
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const isTodayDate = isToday(day.date);
                const baseClasses = 'min-h-24 p-2 rounded-lg transition-all';
                const todayClasses = isTodayDate ? 'ring-2 ring-blue-600 ring-offset-1' : '';
                const borderClasses = `border-3 ${getStatusBorderColor(day.status)}`;

                return (
                  <div
                    key={`${day.dateString}-${index}`}
                    className={`${baseClasses} bg-white ${todayClasses} ${borderClasses}`}
                    style={{ borderWidth: '3px' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`text-sm font-medium text-gray-900 ${
                          isTodayDate ? 'text-blue-600 font-bold' : ''
                        }`}
                      >
                        {day.date.getDate()}
                      </span>
                    </div>

                    {day.bookings.length > 0 && (
                      <div className="space-y-1">
                        {day.bookings.slice(0, 2).map((booking) => (
                          <div
                            key={booking.id}
                            className="text-xs p-1 rounded bg-gray-100 truncate"
                            title={booking.courses?.title || 'Booking'}
                          >
                            {booking.courses?.title || 'Booking'}
                          </div>
                        ))}
                        {day.bookings.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{day.bookings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Legend</h3>
          <p className="text-xs text-gray-600 mt-1">Status indicators for calendar dates</p>
        </div>
        <div className="p-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-green-500 rounded"></div>
              <span className="text-gray-700">Available ({filterCounts.available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-gray-400 rounded"></div>
              <span className="text-gray-700">Not Available ({filterCounts.not_available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-red-500 rounded"></div>
              <span className="text-gray-700">Blocked ({filterCounts.blocked})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-yellow-500 rounded"></div>
              <span className="text-gray-700">Tentative ({filterCounts.tentative})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-orange-500 rounded"></div>
              <span className="text-gray-700">Booked ({filterCounts.booked})</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

