import { Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ParticipationMetrics } from '../../types/database';

interface ParticipationStatsCardProps {
  metrics: ParticipationMetrics;
}

export function ParticipationStatsCard({ metrics }: ParticipationStatsCardProps) {
  const stats = [
    {
      label: 'Total Participants',
      value: metrics.total_participants,
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Total Sessions',
      value: metrics.total_sessions,
      icon: Calendar,
      color: 'text-green-600 bg-green-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Participation Statistics</h2>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-center">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg flex-1 max-w-xs">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
