import {
    X,
    Star,
    MapPin,
    BookOpen,
    FileText,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import { Course } from '../lib/api-client';
import { formatDuration } from '../utils/calendarHelpers';

type CourseDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
};

export function CourseDetailModal({ isOpen, onClose, course }: CourseDetailModalProps) {
    if (!isOpen || !course) return null;

    const renderStars = (rating: number | null) => {
        if (!rating) return null;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-5 h-5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
            );
        }
        return stars;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-[90%] lg:w-[80%] bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all h-[80vh] flex flex-col">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-gray-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Header Image Area */}
                    <div className="h-64 bg-gray-200 relative">
                        {(course as any).image_url ? (
                            <img
                                src={(course as any).image_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
                                <span className="text-white text-4xl font-bold opacity-30">{course.title.charAt(0)}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8">
                            <h2 className="text-3xl font-bold text-white mb-2 shadow-sm">{course.title}</h2>
                            <div className="flex items-center gap-3">
                                {course.course_type && (
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-medium rounded-full border border-white/30">
                                        {course.course_type}
                                    </span>
                                )}
                                {course.hrdc_claimable && (
                                    <span className="px-3 py-1 bg-green-500/80 backdrop-blur-md text-white text-sm font-medium rounded-full">
                                        HRDC Claimable
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Left Content - Scrollable */}
                        <div className="flex-1 p-8 overflow-y-auto">

                            {/* Introduction */}
                            {course.description && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Course Introduction</h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>
                                </div>
                            )}

                            {/* Learning Objectives */}
                            {course.learning_objectives && course.learning_objectives.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Learning Objectives</h3>
                                    <ul className="space-y-3">
                                        {course.learning_objectives.map((objective: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 text-lg">{objective}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Learning Outcomes */}
                            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Learning Outcomes</h3>
                                    <ul className="space-y-3">
                                        {course.learning_outcomes.map((outcome: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 text-lg">{outcome}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Target Audience */}
                            {course.target_audience && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Target Audience</h3>
                                    <p className="text-gray-700 text-lg">{course.target_audience}</p>
                                </div>
                            )}

                            {/* Methodology */}
                            {course.methodology && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Methodology</h3>
                                    <p className="text-gray-700 text-lg">{course.methodology}</p>
                                </div>
                            )}

                            {/* Prerequisites */}
                            {course.prerequisite && (
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-400">Prerequisites</h3>
                                    <p className="text-gray-700 text-lg">{course.prerequisite}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - Fixed/Sticky style */}
                        <div className="w-full lg:w-[350px] bg-amber-400 p-6 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Course Details</h3>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Duration:</p>
                                        <p className="text-gray-900 font-semibold text-lg">
                                            {course.duration_hours ? formatDuration(course.duration_hours, course.duration_unit) : 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Assessment:</p>
                                        <p className="text-gray-900 font-semibold text-lg">
                                            {course.assessment ? 'Yes' : 'No'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Certificate:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {course.certificate ? (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                                    {course.certificate}
                                                </span>
                                            ) : 'N/A'}
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    <div className="space-y-3 pt-2">
                                        <button className="w-full py-3 px-4 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                                            View Trainers
                                        </button>
                                        <button className="w-full py-3 px-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                                            Log In to Book
                                        </button>
                                        <button className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                            Request Custom Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
