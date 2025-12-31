import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { fetchTrainerCourses, fetchCourseDates } from '../../lib/analyticsService';

interface AnalyticsFiltersProps {
  trainerId: string;
  appliedCourseId: string | null;
  appliedDate: string | null;
  onFilterChange: (courseId: string | null, courseDate: string | null) => void;
}

export function AnalyticsFilters({ trainerId, appliedCourseId, appliedDate, onFilterChange }: AnalyticsFiltersProps) {
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(appliedCourseId || '');
  const [selectedDate, setSelectedDate] = useState<string>(appliedDate || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [trainerId]);

  useEffect(() => {
    setSelectedCourse(appliedCourseId || '');
    setSelectedDate(appliedDate || '');
  }, [appliedCourseId, appliedDate]);

  useEffect(() => {
    if (selectedCourse) {
      loadDates(selectedCourse);
    } else {
      setDates([]);
      setSelectedDate('');
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await fetchTrainerCourses(trainerId);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDates = async (courseId: string) => {
    setLoading(true);
    try {
      const datesData = await fetchCourseDates(trainerId, courseId);
      setDates(datesData);
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(
      selectedCourse || null,
      selectedDate || null
    );
  };

  const handleClearFilters = () => {
    setSelectedCourse('');
    setSelectedDate('');
    setDates([]);
    onFilterChange(null, null);
  };

  const hasActiveFilters = appliedCourseId || appliedDate;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!selectedCourse || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
          >
            <option value="">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={handleApplyFilters}
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            Apply
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="px-3"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {appliedCourseId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Course: {courses.find(c => c.id === appliedCourseId)?.title}
              <button
                onClick={() => {
                  setSelectedCourse('');
                  setSelectedDate('');
                  onFilterChange(null, null);
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {appliedDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Date: {new Date(appliedDate).toLocaleDateString()}
              <button
                onClick={() => {
                  setSelectedDate('');
                  onFilterChange(appliedCourseId, null);
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
