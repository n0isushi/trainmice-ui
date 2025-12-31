import { CalendarFilter } from '../../types/database';

interface CalendarFilterTabsProps {
  activeFilter: CalendarFilter;
  onChange: (filter: CalendarFilter) => void;
  counts: Record<CalendarFilter, number>;
}

const FILTER_LABELS: Record<CalendarFilter, string> = {
  all: 'All',
  booked: 'Booked',
  blocked: 'Blocked',
  available: 'Available',
  not_available: 'Not Available',
  tentative: 'Tentative'
};

export function CalendarFilterTabs({ activeFilter, onChange, counts }: CalendarFilterTabsProps) {
  const filters: CalendarFilter[] = ['all', 'booked', 'blocked', 'available', 'not_available', 'tentative'];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        const count = counts[filter];

        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{FILTER_LABELS[filter]}</span>
            {count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
