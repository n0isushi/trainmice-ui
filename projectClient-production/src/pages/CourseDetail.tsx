import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  BookOpen,
  FileText,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  User,
  Lock,
} from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useTrainerByCourseId } from '../hooks/useTrainers';
import { AdvancedBookingModal } from '../components/AdvancedBookingModal';
import { BookingModal } from '../components/BookingModal';
import { InHouseCalendarBookingModal } from '../components/InHouseCalendarBookingModal';
import { BookingSelectionModal } from '../components/BookingSelectionModal';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
import { LoginModal } from '../components/LoginModal';
import { SignupModal } from '../components/SignupModal';
import { useAvailability } from '../hooks/useAvailability';
import { auth } from '../lib/auth';
import { formatDuration } from '../utils/calendarHelpers';
import { apiClient } from '../lib/api-client';

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { course, loading: courseLoading, error: courseError } = useCourse(id);
  const { trainer, loading: trainerLoading, error: trainerError } = useTrainerByCourseId(course?.trainer_id);
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isPublicRequestModalOpen, setIsPublicRequestModalOpen] = useState(false);
  const [isInHouseModalOpen, setIsInHouseModalOpen] = useState(false);
  const { availability } = useAvailability(trainer?.id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    auth.getSession().then(({ user }) => {
      setIsAuthenticated(!!user);
    });

    const unsubscribe = auth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    // Listen for modal open events
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    const handleOpenSignup = () => setIsSignupModalOpen(true);

    window.addEventListener('openLogin', handleOpenLogin);
    window.addEventListener('openSignup', handleOpenSignup);

    return () => {
      unsubscribe();
      window.removeEventListener('openLogin', handleOpenLogin);
      window.removeEventListener('openSignup', handleOpenSignup);
    };
  }, []);

  // Fetch events for this course to check for Public events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!course?.id) {
        setPublicEvents([]);
        return;
      }
      
      try {
        setLoadingEvents(true);
        const eventsResponse = await apiClient.getEvents({ courseId: course.id });
        const events = eventsResponse?.events || [];
        
        console.log('[CourseDetail] Fetched events:', events);
        
        // Filter for Public events that are in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futurePublicEvents = events.filter((e: any) => {
          const eventDate = new Date(e.eventDate || e.event_date);
          eventDate.setHours(0, 0, 0, 0);
          
          // Check if event is Public - handle JSON array from database
          let courseTypes: string[] = [];
          if (Array.isArray(e.courseType)) {
            courseTypes = e.courseType;
          } else if (e.courseType) {
            try {
              const parsed = typeof e.courseType === 'string' 
                ? JSON.parse(e.courseType) 
                : e.courseType;
              courseTypes = Array.isArray(parsed) ? parsed : [];
            } catch {
              courseTypes = [];
            }
          }
          
          // Also check course_type field for compatibility
          if (Array.isArray(e.course_type)) {
            courseTypes = [...courseTypes, ...e.course_type];
          } else if (e.course_type) {
            try {
              const parsed = typeof e.course_type === 'string' 
                ? JSON.parse(e.course_type) 
                : e.course_type;
              if (Array.isArray(parsed)) {
                courseTypes = [...courseTypes, ...parsed];
              }
            } catch {
              // Ignore parse errors
            }
          }
          
          const allTypes = courseTypes.map((t: string) => String(t).toUpperCase());
          const isPublic = allTypes.includes('PUBLIC');
          
          return eventDate >= today && isPublic;
        }).sort((a: any, b: any) => {
          const dateA = new Date(a.eventDate || a.event_date).getTime();
          const dateB = new Date(b.eventDate || b.event_date).getTime();
          return dateA - dateB;
        });
        
        console.log('[CourseDetail] Future public events:', futurePublicEvents);
        setPublicEvents(futurePublicEvents);
      } catch (error) {
        console.error('[CourseDetail] Error fetching events:', error);
        setPublicEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [course?.id]);

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLogin'));
      return;
    }
    setIsBookNowModalOpen(true);
  };

  const handleRequestCustomSchedule = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLogin'));
      return;
    }
    setIsSelectionModalOpen(true);
  };

  const handleSelectPublic = () => {
    setIsSelectionModalOpen(false);
    setIsPublicRequestModalOpen(true);
  };

  const handleSelectInHouse = () => {
    setIsSelectionModalOpen(false);
    setIsInHouseModalOpen(true);
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-8 mb-4">
            <p className="text-red-600 font-medium mb-2">Unable to load course</p>
            <p className="text-red-500 text-sm mb-4">{courseError || 'Course not found'}</p>
            {id && (
              <p className="text-gray-600 text-xs">
                Course ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{id}</code>
              </p>
            )}
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blur overlay only when modals are open */}
      {(isLoginModalOpen || isSignupModalOpen) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 pointer-events-none"></div>
      )}

      <div>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                {course.hrdc_claimable && (
                  <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    HRDC Claimable
                  </span>
                )}
              </div>

              {course.course_type && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-base font-medium rounded-full">
                    {course.course_type}
                  </span>
                </div>
              )}

              {course.course_rating != null && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">{renderStars(course.course_rating)}</div>
                  <span className="text-lg text-gray-600">{course.course_rating.toFixed(1)}</span>
                </div>
              )}

              {course.description && (
                <div className="mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
                </div>
              )}

              {course.learning_objectives && course.learning_objectives.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Course Objectives
                  </h2>
                  <ul className="space-y-3">
                    {course.learning_objectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.category && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                  <p className="text-gray-700">{course.category}</p>
                </div>
              )}

              {course.target_audience && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Audience</h3>
                  <p className="text-gray-700">{course.target_audience}</p>
                </div>
              )}

              {course.methodology && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Methodology</h3>
                  <p className="text-gray-700">{course.methodology}</p>
                </div>
              )}

              {course.prerequisite && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Prerequisite</h3>
                  <p className="text-gray-700">{course.prerequisite}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* {course.price !== null && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-xl font-semibold text-gray-900">
                        RM {course.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )} */}

                {course.slots_left !== null && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="text-sm text-gray-600">Available Slots</p>
                      <p className="text-xl font-semibold text-gray-900">{course.slots_left}</p>
                    </div>
                  </div>
                )}

                {course.duration_hours && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDuration(course.duration_hours, course.duration_unit)}
                      </p>
                    </div>
                  </div>
                )}

                {course.venue && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="text-xl font-semibold text-gray-900">{course.venue}</p>
                    </div>
                  </div>
                )}
              </div>

              {course.teaching_method && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Teaching Method</h3>
                  <p className="text-gray-700">{course.teaching_method}</p>
                </div>
              )}

              {(course.event_date || course.start_date) && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.start_date && course.end_date ? 'Event Dates' : 'Event Date'}
                    </h3>
                  </div>
                  {course.start_date && course.end_date ? (
                    <div className="mt-2">
                      <p className="text-blue-900 font-medium">
                        <span className="font-semibold">Start:</span>{' '}
                        {new Date(course.start_date).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-blue-900 font-medium mt-1">
                        <span className="font-semibold">End:</span>{' '}
                        {new Date(course.end_date).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-900 font-medium mt-2">
                      {new Date(course.event_date || course.start_date).toLocaleDateString('en-MY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-start">
                {course.brochure_url && (
                  <a
                    href={course.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Download Brochure
                  </a>
                )}

                {publicEvents.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleBookNow}
                      className="inline-flex flex-col items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>Book Now</span>
                      </div>
                      {publicEvents.length === 1 && (
                        <span className="text-xs mt-1 opacity-90">
                          {new Date(publicEvents[0].eventDate || publicEvents[0].event_date).toLocaleDateString('en-MY', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {publicEvents.length > 1 && (
                        <span className="text-xs mt-1 opacity-90">
                          {publicEvents.length} available dates
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleRequestCustomSchedule}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal-600 text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition-all duration-200"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Request Custom Schedule</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestCustomSchedule}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Request Custom Schedule</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
              <dl className="space-y-3">
                {course.category && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Category</dt>
                    <dd className="text-base text-gray-900">{course.category}</dd>
                  </div>
                )}
                {course.city && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">City</dt>
                    <dd className="text-base text-gray-900">{course.city}</dd>
                  </div>
                )}
                {course.state && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">State</dt>
                    <dd className="text-base text-gray-900">{course.state}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Trainer Information - Only show when authenticated */}
        {isAuthenticated && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trainer Information</h2>

            {trainerLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading trainer information...</p>
            </div>
          ) : !course.trainer_id ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No trainer assigned to this course yet.</p>
            </div>
          ) : trainerError ? (
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-8 text-center">
              <p className="text-red-600 font-medium mb-2">Unable to load trainer information</p>
              <p className="text-red-500 text-sm mb-4">{trainerError}</p>
              <p className="text-gray-600 text-sm">
                Trainer ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{course.trainer_id}</code>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                If this issue persists, please contact support with the Trainer ID above.
              </p>
            </div>
          ) : !trainer ? (
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-8 text-center">
              <p className="text-yellow-800 font-medium mb-2">Trainer information not available</p>
              <p className="text-yellow-700 text-sm">
                This course has an assigned trainer but their profile couldn't be found.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Trainer ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{course.trainer_id}</code>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {trainer.profile_pic ? (
                    <img
                      src={trainer.profile_pic}
                      alt={trainer.full_name || 'Trainer'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (trainer.full_name || 'T').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Course Trainer</h3>
                  <p className="text-base text-gray-700 font-medium mt-1">{trainer.full_name || 'Name not available'}</p>
                  {trainer.job_title && (
                    <p className="text-sm text-gray-600 mt-1">{trainer.job_title}</p>
                  )}
                  {trainer.rating != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {renderStars(trainer.rating)}
                      </div>
                      <span className="text-sm text-gray-600">{trainer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Trainer ID</p>
                    <p className="text-lg font-mono text-gray-900">
                      {trainer.custom_trainer_id || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {trainer.year_of_experience !== null && trainer.year_of_experience > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-base font-semibold text-gray-900">
                    {trainer.year_of_experience} years in training
                  </p>
                </div>
              )}

              {trainer.areas_of_expertise && trainer.areas_of_expertise.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.areas_of_expertise.slice(0, 4).map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                    {trainer.areas_of_expertise.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{trainer.areas_of_expertise.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  to={`/trainers/${course.trainer_id}`}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors text-center"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
      </div>

      {/* Show EventRegistrationModal if course has fixed_date OR if there are public events */}
      {course?.fixed_date || publicEvents.length > 0 ? (
        <EventRegistrationModal
          isOpen={isBookNowModalOpen}
          onClose={() => setIsBookNowModalOpen(false)}
          course={course}
        />
      ) : (
        <BookingModal
          isOpen={isBookNowModalOpen}
          onClose={() => setIsBookNowModalOpen(false)}
          course={course}
          trainer={trainer}
        />
      )}

      <BookingSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelectPublic={handleSelectPublic}
        onSelectInHouse={handleSelectInHouse}
        course={course}
        trainer={trainer}
      />

      <AdvancedBookingModal
        isOpen={isPublicRequestModalOpen}
        onClose={() => setIsPublicRequestModalOpen(false)}
        course={course}
        trainer={trainer}
        availability={availability}
      />

      <InHouseCalendarBookingModal
        isOpen={isInHouseModalOpen}
        onClose={() => setIsInHouseModalOpen(false)}
        course={course}
        trainer={trainer || null}
      />

      {/* Login and Signup Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          setIsAuthenticated(true);
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onSignupSuccess={() => {
          // After successful signup, automatically open login modal
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}
