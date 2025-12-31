import { CalendarDay } from '../../types/database';

interface CalendarDayCellProps {
  day: CalendarDay;
  onClick: () => void;
}

const getStatusBorderColor = (status: CalendarDay['status']): string => {
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
};

export function CalendarDayCell({ day, onClick }: CalendarDayCellProps) {
  const { date, isCurrentMonth, isToday, status, bookings } = day;

  const baseClasses = 'min-h-24 p-2 rounded-lg cursor-pointer transition-all hover:shadow-lg';
  const monthClasses = isCurrentMonth ? 'bg-white' : 'bg-gray-50';
  const todayClasses = isToday ? 'ring-2 ring-blue-600 ring-offset-1' : '';
  const borderClasses = `border-3 ${getStatusBorderColor(status)}`;

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${monthClasses} ${todayClasses} ${borderClasses}`}
      style={{ borderWidth: '3px' }}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-sm font-medium ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600 font-bold' : ''}`}
        >
          {date.getDate()}
        </span>
      </div>

      {bookings.length > 0 && (
        <div className="space-y-1">
          {bookings.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className="text-xs p-1 rounded bg-gray-100 truncate"
              title={booking.courses?.title || 'Booking'}
            >
              {booking.courses?.title || 'Booking'}
            </div>
          ))}
          {bookings.length > 2 && (
            <div className="text-xs text-gray-500 font-medium">
              +{bookings.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
