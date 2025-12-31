import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import { Users, BookOpen, Calendar, FileText, MessageSquare, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface DashboardMetrics {
  totalTrainers: number;
  totalClients: number;
  activeCourses: number;
  pendingBookings: number;
  pendingHRDCVerifications: number;
  unreadMessages: number;
  upcomingCourses: number;
}

interface Activity {
  id: string;
  actionType: string;
  entityType: string;
  description: string;
  createdAt: string;
  user?: {
    email: string;
    fullName: string;
    role: string;
  };
}

interface UpcomingCourse {
  id: string;
  title: string;
  startDate: string;
  trainer?: {
    fullName: string;
  };
  courseTrainers?: Array<{
    trainer: {
      fullName: string;
    };
  }>;
}

interface PendingBooking {
  id: string;
  requestedDate: string;
  status: string;
  course?: {
    title: string;
  };
  trainer?: {
    fullName: string;
  };
  client?: {
    userName: string;
  };
}

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<UpcomingCourse[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsData, activitiesData, coursesData, bookingsData] = await Promise.all([
        apiClient.getDashboardMetrics(),
        apiClient.getActivityTimeline({ limit: 10 }),
        apiClient.getUpcomingCourses(),
        apiClient.getPendingBookingsSummary(),
      ]);

      setMetrics(metricsData);
      setActivities(activitiesData.activities || []);
      setUpcomingCourses(coursesData.courses || []);
      setPendingBookings(bookingsData.bookings || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'APPROVE':
        return 'success';
      case 'REJECT':
        return 'danger';
      default:
        return 'default';
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trainers</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.totalTrainers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.totalClients || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.activeCourses || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
              <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.pendingBookings || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={24} />
              </div>
            </div>
                  </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">HRDC Pending</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.pendingHRDCVerifications || 0}</p>
                </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="text-orange-600" size={24} />
              </div>
            </div>
              </div>
            </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.unreadMessages || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <MessageSquare className="text-red-600" size={24} />
              </div>
            </div>
      </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Courses</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.upcomingCourses || 0}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-lg">
                <TrendingUp className="text-teal-600" size={24} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="text-teal-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Badge variant={getActionBadgeVariant(activity.actionType)}>
                      {activity.actionType}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {activity.user?.fullName || activity.user?.email || 'System'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Courses */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="text-teal-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Upcoming Courses</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upcomingCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming courses</p>
              ) : (
                upcomingCourses.map((course) => (
                  <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{course.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{formatDate(course.startDate)}</span>
                      {course.trainer && (
                        <span>Trainer: {course.trainer.fullName}</span>
                      )}
                      {course.courseTrainers && course.courseTrainers.length > 0 && (
                        <span>
                          Trainers: {course.courseTrainers.map((ct) => ct.trainer.fullName).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Bookings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-yellow-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Pending Bookings</h2>
            </div>
            <Badge variant="warning">{pendingBookings.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No pending bookings
                    </td>
                  </tr>
                ) : (
                  pendingBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.course?.title || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.trainer?.fullName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.client?.userName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.requestedDate ? formatDate(booking.requestedDate) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={booking.status === 'PENDING' ? 'warning' : 'default'}>
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
