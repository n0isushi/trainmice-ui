import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { apiClient } from '../../lib/api-client';

interface MessageAdminModalProps {
  engagement: {
    id: string;
    type?: 'booking' | 'event';
    course?: { title: string };
    courses?: { title: string };
    eventDate?: string;
    requested_date?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export function MessageAdminModal({ engagement, onClose, onSuccess }: MessageAdminModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const engagementTitle = engagement.type === 'event'
    ? engagement.course?.title || 'Event'
    : engagement.courses?.title || 'Course';

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await apiClient.sendMessageToAdmin({
        message: message.trim(),
        relatedEntityType: engagement.type === 'event' ? 'event' : 'booking',
        relatedEntityId: engagement.id,
        subject: `Enquiry about ${engagementTitle}`,
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Message Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Regarding: <span className="font-semibold">{engagementTitle}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to admin here..."
              rows={6}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

