import { Card, CardContent, CardHeader } from '../ui/Card';
import { MonthlyEvent } from '../../types/database';

interface HistoricalTrendChartProps {
  events: MonthlyEvent[];
}

export function HistoricalTrendChart({ events }: HistoricalTrendChartProps) {
  const maxCount = Math.max(...events.map(e => e.count), 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Training Activity Trend</h2>
        <p className="text-sm text-gray-600">Sessions conducted over the last 6 months</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-around gap-2">
          {events.map((event) => {
            const heightPercentage = maxCount > 0 ? (event.count / maxCount) * 100 : 0;
            return (
              <div key={event.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  {event.count > 0 && (
                    <span className="text-xs font-semibold text-blue-600 mb-1">
                      {event.count}
                    </span>
                  )}
                  <div
                    className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-colors cursor-pointer relative group"
                    style={{
                      height: heightPercentage > 0 ? `${Math.max(heightPercentage, 10)}%` : '4px',
                      minHeight: event.count > 0 ? '20px' : '4px'
                    }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {event.count} session{event.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{event.month}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
