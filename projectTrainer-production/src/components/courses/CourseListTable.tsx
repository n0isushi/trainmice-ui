import { useState } from 'react';
import { Edit, Upload, Calendar, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Course, CourseMaterial } from '../../types/database';
import { MaterialsUploadModal } from './MaterialsUploadModal';
import { CourseScheduleModal } from './CourseScheduleModal';
import { fetchCourseMaterials } from '../../lib/courseService';

interface CourseListTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onRefresh: () => void;
}

export function CourseListTable({ courses, onEdit, onDelete, onRefresh }: CourseListTableProps) {
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState<Course | null>(null);
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState<Course | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);

  const handleManageMaterials = async (course: Course) => {
    setSelectedCourseForMaterials(course);
    const materials = await fetchCourseMaterials(course.id);
    setCourseMaterials(materials);
  };

  const handleViewSchedule = (course: Course) => {
    setSelectedCourseForSchedule(course);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      onDelete(courseId);
    }
  };

  const getStatusBadge = (status?: 'draft' | 'published') => {
    if (status === 'published') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Published</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Draft</span>;
  };

  const getCourseTypeDisplay = (courseType: any) => {
  if (!courseType) return 'N/A';

  // If it's already a string (your DB requirement)
  if (typeof courseType === 'string') {
    return courseType;
  }

  // If it's an array (fallback safety)
  if (Array.isArray(courseType)) {
    return courseType.join(', ');
  }

  return 'N/A';
};


  if (courses.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600">
              Create your first course to get started with managing your training programs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {getCourseTypeDisplay(course.course_type)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {course.duration_unit === 'days' 
                        ? `${course.duration_hours} ${course.duration_hours === 1 ? 'day' : 'days'}`
                        : `${course.duration_hours} ${course.duration_hours === 1 ? 'hour' : 'hours'}`
                      }
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => onEdit(course)}
                          className="text-xs px-2 py-1"
                          title="Edit Course"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleManageMaterials(course)}
                          className="text-xs px-2 py-1"
                          title="Manage Materials"
                        >
                          <Upload className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleViewSchedule(course)}
                          className="text-xs px-2 py-1"
                          title="View Schedule"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(course.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedCourseForMaterials && (
        <MaterialsUploadModal
          courseId={selectedCourseForMaterials.id}
          courseName={selectedCourseForMaterials.title}
          materials={courseMaterials}
          onMaterialsUpdate={setCourseMaterials}
          onClose={() => {
            setSelectedCourseForMaterials(null);
            onRefresh();
          }}
        />
      )}

      {selectedCourseForSchedule && (
        <CourseScheduleModal
          course={selectedCourseForSchedule}
          onClose={() => setSelectedCourseForSchedule(null)}
        />
      )}
    </>
  );
}
