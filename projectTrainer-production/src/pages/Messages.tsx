import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { apiClient } from '../lib/api-client';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface Message {
  id: string;
  senderType: 'TRAINER' | 'ADMIN';
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MessageThread {
  id: string;
  trainerId: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  lastMessageBy: string | null;
  unreadCount: number;
  trainer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export function Messages() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchMessageThread();
    }
  }, [user?.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessageThread = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMessageThread();
      setThread(response.thread);
      setMessages(response.messages || []);
      // Dispatch event to refresh header counts
      window.dispatchEvent(new CustomEvent('message:read'));
    } catch (error) {
      console.error('Error fetching message thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const response = await apiClient.sendMessageToAdmin({
        message: message.trim(),
        subject: 'Message from Trainer',
      });
      
      setSuccess(true);
      setMessage('');
      await fetchMessageThread();
      // Dispatch event to refresh header counts
      window.dispatchEvent(new CustomEvent('message:read'));
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Chat with admin for help and support</p>
      </div>

      {/* Conversation Thread */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Conversation with Admin</h2>
              <p className="text-sm text-gray-500">Your message history with the admin team</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Messages Display */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!isTrainer && (
                          <User className="w-4 h-4 text-gray-500" />
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

          {/* Send Message Form */}
          <div className="space-y-4">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✓ Message sent successfully! Admin will respond soon.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Ask any questions or request help from the admin team."
                rows={3}
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending || success}
                className="self-end"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Tips */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Ask questions about your upcoming engagements</li>
            <li>• Request assistance with course materials</li>
            <li>• Report any issues or concerns</li>
            <li>• Get support with platform features</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
