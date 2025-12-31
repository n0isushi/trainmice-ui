import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTrainerAnalytics } from '../hooks/useTrainerAnalytics';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AnalyticsFilters } from '../components/analytics/AnalyticsFilters';
import { OverallRatingCard } from '../components/analytics/OverallRatingCard';
import { InsightSummaryCard } from '../components/analytics/InsightSummaryCard';
import { RatingBreakdownCard } from '../components/analytics/RatingBreakdownCard';
import { ParticipationStatsCard } from '../components/analytics/ParticipationStatsCard';
import { HistoricalTrendChart } from '../components/analytics/HistoricalTrendChart';
import { StrengthsWeaknessesCard } from '../components/analytics/StrengthsWeaknessesCard';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export function Analytics() {
  const { user } = useAuth();
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const { analytics, loading, error } = useTrainerAnalytics(user?.id, {
    courseId: courseFilter,
    courseDate: dateFilter
  });

  const handleFilterChange = (courseId: string | null, courseDate: string | null) => {
    setCourseFilter(courseId);
    setDateFilter(courseDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 py-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.participation_metrics.total_participants === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
        </div>

        {user?.id && (
          <AnalyticsFilters
            trainerId={user.id}
            appliedCourseId={courseFilter}
            appliedDate={dateFilter}
            onFilterChange={handleFilterChange}
          />
        )}

        <Card className="border-gray-200">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Data Available</h3>
              <p className="text-gray-600 text-center max-w-md">
                {courseFilter || dateFilter
                  ? 'No feedback data found for the selected filters. Try adjusting your filter criteria.'
                  : 'You haven\'t received any course feedback yet. Analytics will appear here once participants submit their feedback.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track performance metrics and insights from course feedback</p>
      </div>

      {user?.id && (
        <AnalyticsFilters
          trainerId={user.id}
          appliedCourseId={courseFilter}
          appliedDate={dateFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      <OverallRatingCard rating={analytics.overall_star_rating} />

      <InsightSummaryCard summary={analytics.insight_summary} />

      <ParticipationStatsCard metrics={analytics.participation_metrics} />

      <RatingBreakdownCard ratings={analytics.rating_breakdown} />

      <HistoricalTrendChart events={analytics.events_last_6_months} />

      <StrengthsWeaknessesCard
        strengths={analytics.strengths}
        improvementAreas={analytics.improvement_areas}
      />
    </div>
  );
}
