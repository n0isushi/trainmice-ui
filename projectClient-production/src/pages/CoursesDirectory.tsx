import { useState, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { CourseCard } from '../components/CourseCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { Course } from '../lib/api-client';
import { useCourses } from '../hooks/useCourses';
import { COURSE_CATEGORIES } from '../utils/categories';

export function CoursesDirectory() {
  // Real Data Hook
  const { courses, loading, error } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    courseType: '',
    courseMode: '',
    hrdcClaimable: '',
    category: '',
    city: '',
    state: '',
  });

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filter states
  const [viewLimit, setViewLimit] = useState('30');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Use standard category list instead of dynamically generating from courses
  const categories = COURSE_CATEGORIES;

  const cities = useMemo(() => {
    const citySet = new Set(courses.map((c) => c.city).filter((c): c is string => !!c));
    return Array.from(citySet).sort();
  }, [courses]);

  const states = useMemo(() => {
    const stateSet = new Set(courses.map((c) => c.state).filter((s): s is string => !!s));
    return Array.from(stateSet).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const matchesSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.learning_objectives?.some((obj: string) =>
          obj.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase());

      // Handle array-based courseType filtering
      const matchesCourseType = (() => {
        if (filters.courseType === '') return true;

        // Check if courseType is an array or a single value
        const courseTypes = Array.isArray(course.course_type)
          ? course.course_type
          : course.course_type
            ? [course.course_type]
            : [];

        // Check if the filter value exists in the array
        return courseTypes.includes(filters.courseType);
      })();

      // Handle array-based courseMode filtering with legacy value mapping
      const matchesCourseMode = (() => {
        if (filters.courseMode === '') return true;

        // Map legacy filter values
        let filterMode = filters.courseMode;
        if (filterMode === 'VIRTUAL') filterMode = 'ONLINE';
        if (filterMode === 'BOTH') filterMode = 'HYBRID';

        // Check if courseMode is an array or a single value
        const courseModes = Array.isArray(course.course_mode)
          ? course.course_mode
          : course.course_mode
            ? [course.course_mode]
            : [];

        // Check if the filter value exists in the array
        return courseModes.includes(filterMode);
      })();

      const matchesHRDC =
        filters.hrdcClaimable === '' ||
        course.hrdc_claimable === (filters.hrdcClaimable === 'true');

      const matchesCategory =
        filters.category === '' || course.category === filters.category;

      const matchesCity = filters.city === '' || course.city === filters.city;

      const matchesState = filters.state === '' || course.state === filters.state;

      // Duration Filter Logic
      const matchesDuration = (() => {
        if (durationFilter === 'all') return true;

        // Normalize duration to days for comparison
        let durationInDays = 0;
        if (course.duration_unit === 'days') {
          durationInDays = course.duration_hours || 0;
        } else if (course.duration_unit === 'hours') {
          // Rough estimate: 8 hours = 1 day
          durationInDays = (course.duration_hours || 0) / 8;
        }

        if (durationFilter === '1') return durationInDays <= 1;
        if (durationFilter === '2') return durationInDays > 1 && durationInDays <= 2;
        if (durationFilter === '3') return durationInDays >= 3;

        return true;
      })();

      return (
        matchesSearch &&
        matchesCourseType &&
        matchesCourseMode &&
        matchesHRDC &&
        matchesCategory &&
        matchesCity &&
        matchesState &&
        matchesDuration
      );
    });

    // Sort Logic
    result.sort((a, b) => {
      if (sortBy === 'a-z') return a.title.localeCompare(b.title);
      if (sortBy === 'z-a') return b.title.localeCompare(a.title);
      if (sortBy === 'latest') return 0; // Placeholder for date sorting (b.created_at - a.created_at)
      if (sortBy === 'oldest') return 0; // Placeholder for date sorting (a.created_at - b.created_at)
      if (sortBy === 'popular') return 0; // Placeholder for popularity
      return 0;
    });

    // View Limit
    if (viewLimit !== 'all') {
      result = result.slice(0, parseInt(viewLimit));
    }

    return result;
  }, [courses, searchQuery, filters, viewLimit, durationFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar - Centered */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center gap-4">
          <div className="w-full max-w-2xl">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Quick Filters Bar */}
          <div className="w-full max-w-2xl grid grid-cols-3 gap-4 py-2">
            {/* View Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">View:</span>
              <select
                value={viewLimit}
                onChange={(e) => setViewLimit(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 shadow-sm transition-all hover:border-gray-400"
              >
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="90">90</option>
                <option value="120">120</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Duration:</span>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 shadow-sm transition-all hover:border-gray-400"
              >
                <option value="all">All</option>
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3+ Days</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 shadow-sm transition-all hover:border-gray-400"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-5 pr-8 mt-8">
        {/* Filters Sidebar - Yellow Theme - Sticky */}
        <aside className="lg:w-80 flex-shrink-0 lg:pl-6 sticky top-24 self-start h-[calc(100vh-8rem)] overflow-y-auto">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            categories={categories}
            cities={cities}
            states={states}
          />
        </aside>

        {/* Courses Grid */}
        <main className="flex-1">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              Error loading courses: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Courses
                  <span className="ml-3 text-lg font-normal text-gray-600">
                    [{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}]
                  </span>
                </h2>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-600">No courses found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        courseType: '',
                        courseMode: '',
                        hrdcClaimable: '',
                        category: '',
                        city: '',
                        state: '',
                      });
                      // Reset new filters too
                      setDurationFilter('all');
                      setSortBy('latest');
                    }}
                    className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onClick={() => setSelectedCourse(course)} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {/* Course Detail Modal */}
      <CourseDetailModal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
      />
    </div>
  );
}
