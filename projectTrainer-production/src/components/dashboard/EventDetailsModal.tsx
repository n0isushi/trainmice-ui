import { X, Calendar, MapPin, Clock, DollarSign, BookOpen, FileText, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface EventDetailsModalProps {
  event: {
    id: string;
    eventDate: string;
    venue: string | null;
    price: number | null;
    durationHours: number;
    durationUnit: string | null;
    category: string | null;
    courseType: string | string[];
    courseMode?: string | string[];
    hrdcClaimable?: boolean;
    maxPacks: number | null;
    status?: string;
    _count?: { registrations: number };
    course?: {
      id: string;
      title: string;
      courseCode: string | null;
      description?: string | null;
    };
    title?: string;
    description?: string | null;
    city?: string | null;
    state?: string | null;
  };
  onClose: () => void;
  onMessage?: () => void;
}

export function EventDetailsModal({ event, onMessage, onClose }: EventDetailsModalProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const title = event.course?.title || event.title || 'Event Title N/A';
  const description = event.course?.description || event.description;
  const courseCode = event.course?.courseCode;
  const eventDate = formatDate(event.eventDate);
  const eventTime = formatTime(event.eventDate);
  const duration = `${event.durationHours} ${event.durationUnit || 'hours'}`;
  const courseType = Array.isArray(event.courseType) ? event.courseType.join(', ') : event.courseType;
  const courseMode = Array.isArray(event.courseMode) ? event.courseMode.join(', ') : event.courseMode || 'N/A';
  const location = event.venue || 'Location TBD';
  const fullLocation = event.city && event.state 
    ? `${location}, ${event.city}, ${event.state}`
    : location;
  const participants = event._count?.registrations || 0;
  const maxParticipants = event.maxPacks;
  const status = event.status || 'ACTIVE';

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Event ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium mb-1">Event ID</p>
                <p className="text-gray-900 font-mono text-sm">{event.id}</p>
                {courseCode && (
                  <p className="text-xs text-gray-600 mt-1">Course Code: {courseCode}</p>
                )}
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Course Title */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Course Title</p>
              <p className="text-lg font-semibold text-gray-900">{title}</p>
              {description && (
                <p className="text-sm text-gray-600 mt-2">{description}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Date & Time</p>
              <p className="text-gray-900 font-medium">{eventDate}</p>
              {eventTime && (
                <p className="text-sm text-gray-600 mt-1">{eventTime}</p>
              )}
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Venue</p>
              <p className="text-gray-900 font-medium">{fullLocation}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="text-gray-900 font-medium">{duration}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Participants</p>
              <p className="text-gray-900 font-medium">
                {participants}
                {maxParticipants ? ` / ${maxParticipants}` : ''} registered
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.price !== null && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-500">Price</p>
                </div>
                <p className="text-gray-900 font-medium">RM {parseFloat(String(event.price)).toFixed(2)}</p>
              </div>
            )}

            {event.category && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-500">Category</p>
                </div>
                <p className="text-gray-900 font-medium">{event.category}</p>
              </div>
            )}

            {courseType && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Course Type</p>
                <p className="text-gray-900 font-medium">{courseType}</p>
              </div>
            )}

            {courseMode && courseMode !== 'N/A' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Course Mode</p>
                <p className="text-gray-900 font-medium">{courseMode}</p>
              </div>
            )}
          </div>

          {event.hrdcClaimable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">
                ✓ HRDC Claimable
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {onMessage && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={onMessage}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              >
                Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

