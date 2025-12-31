import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import { showToast } from '../components/common/Toast';
import { Filter, X, TrendingUp, Users, Star } from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface Feedback {
  id: string;
  participantName: string | null;
  event: {
    id: string;
    title: string;
    eventDate: Date;
  } | null;
  trainer: {
    id: string;
    fullName: string;
  } | null;
  course: {
    id: string;
    title: string;
  } | null;
  courseDate: Date | null;
  contentClarity: number | null;
  objectivesAchieved: number | null;
  materialsHelpful: number | null;
  learningEnvironment: number | null;
  trainerKnowledge: number | null;
  trainerEngagement: number | null;
  knowledgeExposure: number | null;
  knowledgeApplication: number | null;
  durationSuitable: number | null;
  recommendCourse: number | null;
  likedMost: string | null;
  improvementSuggestion: string | null;
  additionalComments: string | null;
  recommendColleagues: boolean | null;
  referralDetails: string | null;
  futureTrainingTopics: string | null;
  inhouseTrainingNeeds: string | null;
  teamBuildingInterest: string | null;
  createdAt: Date;
}

interface FeedbackSummary {
  total: number;
  averages: {
    contentClarity: number | null;
    objectivesAchieved: number | null;
    materialsHelpful: number | null;
    learningEnvironment: number | null;
    trainerKnowledge: number | null;
    trainerEngagement: number | null;
    knowledgeExposure: number | null;
    knowledgeApplication: number | null;
    durationSuitable: number | null;
    recommendCourse: number | null;
  };
}

export const FeedbackAnalyticsPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    trainerId: '',
    courseId: '',
    eventId: '',
    courseDate: '',
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.trainerId) params.trainerId = filters.trainerId;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.eventId) params.eventId = filters.eventId;
      if (filters.courseDate) params.courseDate = filters.courseDate;

      const response = await apiClient.getFeedbackAnalytics(params);
      setFeedbacks(response.feedbacks);
      setSummary(response.summary);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      showToast(error.message || 'Error fetching feedback analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchFeedbacks();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ trainerId: '', courseId: '', eventId: '', courseDate: '' });
    fetchFeedbacks();
  };

  const formatRating = (rating: number | null) => {
    if (rating === null) return 'N/A';
    return rating.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Feedback Analytics</h1>
          <p className="text-gray-600 mt-1">
            {summary?.total || 0} feedback submission(s) found
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Trainer ID"
                value={filters.trainerId}
                onChange={(e) => setFilters({ ...filters, trainerId: e.target.value })}
                placeholder="Filter by trainer ID"
              />
              <Input
                label="Course ID"
                value={filters.courseId}
                onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                placeholder="Filter by course ID"
              />
              <Input
                label="Event ID"
                value={filters.eventId}
                onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}
                placeholder="Filter by event ID"
              />
              <Input
                label="Course Date"
                type="date"
                value={filters.courseDate}
                onChange={(e) => setFilters({ ...filters, courseDate: e.target.value })}
                placeholder="Filter by course date"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="secondary" onClick={clearFilters}>
                Clear
              </Button>
              <Button variant="primary" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedbacks</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
                </div>
                <Users className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Overall Rating</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.averages.recommendCourse
                      ? formatRating(summary.averages.recommendCourse)
                      : 'N/A'}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Trainer Rating</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.averages.trainerKnowledge && summary.averages.trainerEngagement
                      ? formatRating(
                          (summary.averages.trainerKnowledge +
                            summary.averages.trainerEngagement) /
                            2
                        )
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Average Ratings */}
      {summary && summary.total > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Average Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Content Clarity</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.contentClarity)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Objectives Achieved</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.objectivesAchieved)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Materials Helpful</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.materialsHelpful)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Learning Environment</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.learningEnvironment)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trainer Knowledge</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.trainerKnowledge)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trainer Engagement</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.trainerEngagement)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Knowledge Exposure</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.knowledgeExposure)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Knowledge Application</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.knowledgeApplication)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration Suitable</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.durationSuitable)} / 5.00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recommend Course</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatRating(summary.averages.recommendCourse)} / 5.00
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback List */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Feedbacks</h2>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No feedbacks found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {feedback.participantName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {feedback.event?.title || feedback.course?.title || 'N/A'}
                      </p>
                      {feedback.courseDate && (
                        <p className="text-xs text-gray-500">
                          {formatDate(feedback.courseDate.toString())}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(feedback.createdAt.toString())}
                    </p>
                  </div>

                  {feedback.likedMost && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Liked Most:</p>
                      <p className="text-sm text-gray-600">{feedback.likedMost}</p>
                    </div>
                  )}

                  {feedback.improvementSuggestion && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Improvement Suggestion:</p>
                      <p className="text-sm text-gray-600">{feedback.improvementSuggestion}</p>
                    </div>
                  )}

                  {feedback.recommendColleagues && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Would recommend to colleagues
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
