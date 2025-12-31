import { Calendar, MapPin, BookOpen, Check, X, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookingWithCourse } from '../../types/database';
import { useState } from 'react';

interface TrainingRequestCardProps {
  request: BookingWithCourse;
  onConfirm: (requestId: string) => Promise<void>;
  onDecline: (requestId: string) => Promise<void>;
}

export function TrainingRequestCard({ request, onConfirm, onDecline }: TrainingRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (hours: number | null, unit: string | null) => {
    if (!hours) return 'Duration TBD';
    if (unit === 'days') {
      return `${hours} ${hours === 1 ? 'day' : 'days'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await onDecline(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {request.courses?.title || 'Course Request'}
              </h3>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded whitespace-nowrap">
                Pending
              </span>
            </div>
            {request.client_name && (
              <p className="text-sm text-gray-600">From: {request.client_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                Duration: {formatDuration(
                  request.courses?.duration_hours || null,
                  request.courses?.duration_unit || null
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(request.requested_date)}</span>
              {request.requested_time && (
                <span className="text-gray-500">• {request.requested_time}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>
                {request.location || 'Location TBD'}
                {request.city && request.state && `, ${request.city}, ${request.state}`}
                {request.city && !request.state && `, ${request.city}`}
                {!request.city && request.state && `, ${request.state}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{request.request_type || 'N/A'} Training</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-1" />
              Confirm
            </Button>
            <Button
              onClick={handleDecline}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
