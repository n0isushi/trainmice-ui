import { CalendarDay } from '../../types/database';
import { CalendarDayCell } from './CalendarDayCell';
import { SHORT_WEEKDAY_NAMES } from '../../lib/calendarUtils';

interface CalendarGridProps {
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
}

export function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
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
        {days.map((day, index) => (
          <CalendarDayCell
            key={`${day.dateString}-${index}`}
            day={day}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
}
