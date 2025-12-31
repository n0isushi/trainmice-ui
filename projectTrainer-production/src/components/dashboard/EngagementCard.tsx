import { Calendar, MapPin, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookingWithCourse } from '../../types/database';

interface EventEngagement {
  id: string;
  eventDate: string;
  course?: { title: string };
  venue: string | null;
  _count?: { registrations: number };
  type: 'event';
}

type CombinedEngagement = (BookingWithCourse & { type?: 'booking' }) | EventEngagement;

interface EngagementCardProps {
  engagement: CombinedEngagement;
  onViewDetails: (engagement: CombinedEngagement) => void;
  onMessage?: (engagement: CombinedEngagement) => void;
}

export function EngagementCard({ engagement, onViewDetails, onMessage }: EngagementCardProps) {
  const formatDate = (dateStr: string | null, timeStr: string | null) => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return timeStr ? `${dateFormatted} at ${timeStr}` : dateFormatted;
  };

  const isEvent = engagement.type === 'event';
  const bookingEngagement = engagement as BookingWithCourse;
  const eventEngagement = engagement as EventEngagement;
  
  const title = isEvent 
    ? eventEngagement.course?.title || 'Event Title N/A'
    : bookingEngagement.courses?.title || 'Course Title N/A';
  const date = isEvent
    ? new Date(eventEngagement.eventDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : formatDate(bookingEngagement.requested_date, bookingEngagement.requested_time);
  const location = isEvent
    ? eventEngagement.venue || 'Location TBD'
    : bookingEngagement.location || 'Location TBD';
  const status = isEvent
    ? 'Booked'
    : bookingEngagement.status?.charAt(0).toUpperCase() + bookingEngagement.status?.slice(1) || 'Booked';
  const participants = isEvent
    ? `${eventEngagement._count?.registrations || 0} participants`
    : bookingEngagement.client_name || 'Client Name N/A';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
              {status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{date}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{participants}</span>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              onClick={() => onViewDetails(engagement)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Details
            </Button>
            {onMessage && (
              <Button
                onClick={() => onMessage(engagement)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
