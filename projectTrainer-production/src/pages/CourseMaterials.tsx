import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Course, CourseMaterial } from '../types/database';
import { fetchCourseById, fetchCourseMaterials } from '../lib/courseService';

export function CourseMaterials() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseAndMaterials();
    }
  }, [courseId]);

  const fetchCourseAndMaterials = async () => {
    try {
      const [courseResult, materialsResult] = await Promise.all([
        fetchCourseById(courseId!),
        fetchCourseMaterials(courseId!),
      ]);

      if (courseResult) {
        setCourse(courseResult as Course);
      }

      if (materialsResult) {
        setMaterials(materialsResult as CourseMaterial[]);
      }
    } catch (error) {
      console.error('Error fetching course materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
              {course.description && (
                <p className="text-gray-600">{course.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {course.course_type && course.course_type.length > 0 ? (
                course.course_type.map((type, index) => (
                  <span key={index} className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                    type === 'In-House' ? 'bg-blue-100 text-blue-700' :
                    type === 'Public' ? 'bg-green-100 text-green-700' :
                    type === 'Virtual' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {type}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap bg-gray-100 text-gray-700">
                  N/A
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900 font-medium">
                  {course.duration_hours} {course.duration_hours === 1 ? 'hour' : 'hours'}
                </p>
              </div>
            </div>

            {course.target_audience && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 md:col-span-2">
                <div>
                  <p className="text-sm text-gray-500">Target Audience</p>
                  <p className="text-gray-900 font-medium">{course.target_audience}</p>
                </div>
              </div>
            )}
          </div>

          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {course.learning_objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Materials & Resources</h2>
            <span className="text-sm text-gray-500">
              {materials.length} {materials.length === 1 ? 'file' : 'files'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No materials available for this course yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">{material.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Uploaded {formatDate(material.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
