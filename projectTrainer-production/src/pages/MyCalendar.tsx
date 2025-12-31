import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CalendarFilterTabs } from '../components/calendar/CalendarFilterTabs';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { BlockDaysPanel } from '../components/calendar/BlockDaysPanel';
import { TentativeBookingsList } from '../components/calendar/TentativeBookingsList';
import { BulkStatusUpdate } from '../components/calendar/BulkStatusUpdate';
import { DayDetailModal } from '../components/calendar/DayDetailModal';
import { DateEditModal } from '../components/calendar/DateEditModal';
import { useCalendarData } from '../hooks/useCalendarData';
import { CalendarFilter, CalendarDay } from '../types/database';
import { getCalendarGrid, buildCalendarDays, getMonthName } from '../lib/calendarUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MyCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [dayToEdit, setDayToEdit] = useState<CalendarDay | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // const startDate = new Date(year, month, 1);
  // const endDate = new Date(year, month + 1, 0);
  const startDate = useMemo(() => new Date(year, month, 1), [year, month]);
  const endDate = useMemo(() => new Date(year, month + 1, 0), [year, month]);


  const { bookings, availabilities, blockedWeekdays, loading, error, refetch } = useCalendarData(
    user?.id || '',
    startDate,
    endDate
  );

  const calendarDates = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarDates, bookings, availabilities, blockedWeekdays, month),
    [calendarDates, bookings, availabilities, blockedWeekdays, month]
  );

  const filteredDays = useMemo(() => {
    if (filter === 'all') return calendarDays;
    return calendarDays.map(day => ({
      ...day,
      isFiltered: day.status !== filter
    }));
  }, [calendarDays, filter]);

  const filterCounts = useMemo(() => {
    const counts: Record<CalendarFilter, number> = {
      all: calendarDays.length,
      booked: 0,
      blocked: 0,
      available: 0,
      not_available: 0,
      tentative: 0
    };

    calendarDays.forEach(day => {
      if (day.status === 'booked') counts.booked++;
      else if (day.status === 'blocked') counts.blocked++;
      else if (day.status === 'available') counts.available++;
      else if (day.status === 'not_available') counts.not_available++;
      else if (day.status === 'tentative') counts.tentative++;
    });

    return counts;
  }, [calendarDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-600">Please log in to view your calendar.</p>
      </div>
    );
  }

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
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your availability and bookings</p>
        </div>
      </div>

      <CalendarFilterTabs
        activeFilter={filter}
        onChange={setFilter}
        counts={filterCounts}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getMonthName(month)} {year}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Today
                  </button>
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
            </CardHeader>
            <CardContent>
              <CalendarGrid
                days={filteredDays}
                onDayClick={setSelectedDay}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BulkStatusUpdate trainerId={user.id} onUpdate={refetch} />
            <BlockDaysPanel
              trainerId={user.id}
              blockedDays={blockedWeekdays}
              onUpdate={refetch}
            />
          </div>
        </div>

        <div className="space-y-6">
          <TentativeBookingsList bookings={bookings} onUpdate={refetch} />

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Legend</h3>
              <p className="text-xs text-gray-600 mt-1">Click on any date to edit availability</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-green-500 rounded"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-gray-400 rounded"></div>
                  <span className="text-gray-700">Not Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-red-500 rounded"></div>
                  <span className="text-gray-700">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-yellow-500 rounded"></div>
                  <span className="text-gray-700">Tentative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-orange-500 rounded"></div>
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DayDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onEdit={(day) => {
          setDayToEdit(day);
          setSelectedDay(null);
        }}
      />
      <DateEditModal
        day={dayToEdit}
        trainerId={user?.id || ''}
        onClose={() => setDayToEdit(null)}
        onUpdate={() => {
          refetch();
          setDayToEdit(null);
        }}
      />
    </div>
  );
}
