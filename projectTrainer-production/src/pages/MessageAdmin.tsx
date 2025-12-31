import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';

interface LocationState {
  eventId: string;
  courseTitle: string;
  location: string;
  date: string | null;
  time: string | null;
}

export function MessageAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const eventDetails = location.state as LocationState | null;

  const formatDate = (dateStr: string | null, timeStr: string | null) => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    return timeStr ? `${dateFormatted} at ${timeStr}` : dateFormatted;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !eventDetails) return;

    setIsLoading(true);
    try {
      // Reuse contact endpoint on the backend to deliver the message to admin
      await apiClient.post('/contact', {
        name: user?.full_name || user?.email || 'Trainer',
        email: user?.email || 'unknown@trainmice.local',
        subject: `Message from Trainer - Event ${eventDetails.eventId.slice(0, 8)}`,
        message: `Event: ${eventDetails.courseTitle}\nVenue: ${eventDetails.location}\nDate: ${formatDate(
          eventDetails.date,
          eventDetails.time
        )}\n\nMessage:\n${message}`,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!eventDetails) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No event details available</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Message Admin</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Event Information</h2>
          <p className="text-sm text-gray-500 mt-1">
            This information will be automatically included with your message
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Event ID</p>
              <p className="text-gray-900 font-mono text-sm">{eventDetails.eventId}</p>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Course Title</p>
                <p className="text-gray-900 font-medium">{eventDetails.courseTitle}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Venue</p>
                <p className="text-gray-900 font-medium">{eventDetails.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(eventDetails.date, eventDetails.time)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Your Message</h2>
          <p className="text-sm text-gray-500 mt-1">
            Type your questions or concerns below
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                disabled={success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-2">
                {message.length} characters
              </p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  Message sent successfully! Redirecting to dashboard...
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading || success}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
