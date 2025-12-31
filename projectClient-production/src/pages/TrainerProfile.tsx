import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Briefcase,
  Languages,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Building2,
  Award,
} from 'lucide-react';
import { useTrainer } from '../hooks/useTrainers';
import { useCourses } from '../hooks/useCourses';

export function TrainerProfile() {
  const { id } = useParams<{ id: string }>();
  const { trainer, loading: trainerLoading, error: trainerError } = useTrainer(id);
  const { courses } = useCourses();

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-6 h-6 ${
            i <= roundedRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (trainerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading trainer profile...</p>
        </div>
      </div>
    );
  }

  if (trainerError || !trainer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Error loading trainer: {trainerError || 'Trainer not found'}
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const trainerCourses = courses.filter((course) =>
    course && course.trainer_id === trainer.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
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
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
                  {trainer.profile_pic ? (
                    <img
                      src={trainer.profile_pic}
                      alt="Trainer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    'T'
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Trainer {trainer.custom_trainer_id || trainer.id?.substring(0, 8) || 'Profile'}
                  </h1>
                  {trainer.rating != null && (
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(trainer.rating)}</div>
                      <span className="text-lg text-gray-600 ml-1">
                        {trainer.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {trainer.professional_bio && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Professional Biography
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {trainer.professional_bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {trainer.languages && trainer.languages.length > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Languages className="w-6 h-6 text-gray-700 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Languages</p>
                      <p className="text-base font-medium text-gray-900">
                        {trainer.languages.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {trainer.teaching_style && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-gray-700 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Teaching Style</p>
                      <p className="text-base font-medium text-gray-900">
                        {trainer.teaching_style}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {trainer.topics && trainer.topics.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Areas of Expertise
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {trainer.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {trainer.qualifications && trainer.qualifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Qualifications & Education
                  </h2>
                  <ul className="space-y-3">
                    {trainer.qualifications.map((qual: any, idx: number) => (
                      <li key={qual.id || idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {qual.title || qual.qualification_name || 'Qualification'}
                          </p>
                          {(qual.institution || qual.institute_name) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {qual.institution || qual.institute_name}
                            </p>
                          )}
                          {(qual.yearObtained || qual.year_awarded) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {qual.yearObtained || qual.year_awarded}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trainer.workHistory && trainer.workHistory.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work History
                  </h2>
                  <ul className="space-y-3">
                    {trainer.workHistory.map((work: any, idx: number) => {
                      const yearFrom = work.startDate 
                        ? new Date(work.startDate).getFullYear() 
                        : (work.year_from || null);
                      const yearTo = work.endDate 
                        ? new Date(work.endDate).getFullYear() 
                        : (work.year_to || null);
                      const yearRange = yearFrom && yearTo 
                        ? `${yearFrom} - ${yearTo}` 
                        : yearFrom 
                        ? `Since ${yearFrom}` 
                        : yearTo 
                        ? `Until ${yearTo}` 
                        : '';
                      
                      return (
                        <li key={work.id || idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {work.company || work.company_name || 'Company'}
                            </p>
                            {work.position && (
                              <p className="text-sm text-gray-600 mt-1">
                                {work.position}
                              </p>
                            )}
                            {yearRange && (
                              <p className="text-xs text-gray-500 mt-1">
                                {yearRange}
                              </p>
                            )}
                            {work.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {work.description}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {trainer.industry_experience && trainer.industry_experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Industry Experience
                  </h2>
                  <ul className="space-y-2">
                    {trainer.industry_experience.map((industry, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                        <span>{industry}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trainer.pastClients && trainer.pastClients.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Past Clients
                  </h2>
                  <ul className="space-y-3">
                    {trainer.pastClients.map((client: any, idx: number) => (
                      <li key={client.id || idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {client.clientName || client.client_name || 'Client'}
                          </p>
                          {client.projectDescription || client.project_description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {client.projectDescription || client.project_description}
                            </p>
                          )}
                          {client.year && (
                            <p className="text-xs text-gray-500 mt-1">
                              Year: {client.year}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <dl className="space-y-4">
                {trainer.rating != null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Overall Rating</dt>
                    <dd className="flex items-center gap-2">
                      <div className="flex">{renderStars(trainer.rating)}</div>
                      <span className="text-2xl font-bold text-gray-900">
                        {trainer.rating.toFixed(1)} / 5.0
                      </span>
                    </dd>
                  </div>
                )}
                {trainer.state && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Location</dt>
                    <dd className="text-xl font-bold text-gray-900">{trainer.state}</dd>
                  </div>
                )}
                {trainerCourses.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Courses Teaching</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {trainerCourses.length}
                    </dd>
                  </div>
                )}
                {trainer.topics && trainer.topics.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Specializations</dt>
                    <dd className="text-2xl font-bold text-gray-900">{trainer.topics.length}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Courses by This Trainer
            <span className="ml-3 text-lg font-normal text-gray-600">
              ({trainerCourses.length} {trainerCourses.length === 1 ? 'course' : 'courses'})
            </span>
          </h2>
          {trainerCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainerCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {course.category && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {course.category}
                      </span>
                    )}
                    {course.course_type && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {course.course_type}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No courses assigned to this trainer yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
