import { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { apiClient } from '../../lib/api-client';
import { formatDate } from '../../utils/helpers';

interface EventEnquiryMessage {
  id: string;
  senderType: 'TRAINER' | 'ADMIN';
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface EventEnquiry {
  id: string;
  eventId: string;
  trainerId: string;
  message: string;
  subject: string | null;
  isRead: boolean;
  unreadCount: number;
  lastMessageTime: string | null;
  lastMessageBy: string | null;
  event: {
    id: string;
    title: string;
    eventDate: string;
    venue: string | null;
    course: {
      id: string;
      title: string;
    };
  };
  trainer: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface EventChatModalProps {
  event: {
    id: string;
    eventDate: string;
    course: {
      id: string;
      title: string;
    };
    venue: string | null;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventChatModal({ event, onClose, onSuccess }: EventChatModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<EventEnquiry | null>(null);
  const [messages, setMessages] = useState<EventEnquiryMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
  }, [event.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      // First, check if enquiry exists for this event
      const enquiriesResponse = await apiClient.get<{ enquiries: EventEnquiry[] }>(
        `/event-enquiry-messages/trainer/enquiries?eventId=${event.id}`
      );
      
      let enquiryId: string | null = null;
      if (enquiriesResponse.enquiries && enquiriesResponse.enquiries.length > 0) {
        enquiryId = enquiriesResponse.enquiries[0].id;
        // Fetch conversation
        const response = await apiClient.getEventEnquiryConversation(enquiryId);
        setEnquiry(response.enquiry);
        setMessages(response.messages || []);
      } else {
        // No enquiry exists yet - user can create one by sending a message
        setEnquiry(null);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      // If enquiry doesn't exist, that's okay - user can start a new conversation
      setEnquiry(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!enquiry) {
      // Create enquiry first
      try {
        setSending(true);
        const createResponse = await apiClient.post<{ enquiry?: EventEnquiry; isEventEnquiry?: boolean; message?: string }>(
          '/trainer/messages',
          {
            message: message.trim(),
            relatedEntityType: 'event',
            relatedEntityId: event.id,
            subject: `Enquiry about ${event.course.title}`,
          }
        );
        
        if (createResponse.isEventEnquiry) {
          // Refresh to get the created enquiry and messages
          await fetchConversation();
        }
        setMessage('');
        if (onSuccess) onSuccess();
      } catch (error: any) {
        console.error('Error sending message:', error);
        alert(error.message || 'Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    } else {
      // Send reply to existing enquiry
      try {
        setSending(true);
        await apiClient.replyToEventEnquiry(enquiry.id, message.trim());
        setMessage('');
        await fetchConversation(); // Refresh messages
        if (onSuccess) onSuccess();
      } catch (error: any) {
        console.error('Error sending message:', error);
        alert(error.message || 'Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-teal-600 text-white">
          <div>
            <h2 className="text-xl font-semibold">{event.course.title}</h2>
            <p className="text-sm opacity-90">
              {formatDate(event.eventDate)} {event.venue && `• ${event.venue}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 min-h-[400px] max-h-[500px]">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isTrainer = msg.senderType === 'TRAINER';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isTrainer
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!isTrainer && (
                        <User className="w-3 h-3 text-gray-500" />
                      )}
                      <span className="text-xs font-medium opacity-75">
                        {isTrainer ? 'You' : 'Admin'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 opacity-75`}>
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              disabled={sending}
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="self-end bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

