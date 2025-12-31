import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import { MessageSquare, Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import { showToast } from '../components/common/Toast';
import { formatDate } from '../utils/helpers';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
  user?: {
    email: string;
    fullName: string;
    role: string;
  };
}

interface TrainerMessage {
  id: string;
  trainerId: string;
  lastMessage: string;
  lastMessageTime: string;
  isRead: boolean;
  trainer: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface MessageThread {
  id: string;
  trainerId: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  lastMessageBy: string | null;
  unreadCount: number;
  trainer: {
    id: string;
    fullName: string;
    email: string;
  };
  messages?: Message[];
}

interface Message {
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
  createdAt: string;
  trainer: {
    id: string;
    fullName: string;
    email: string;
  };
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
  messages?: EventEnquiryMessage[];
  _count?: {
    messages: number;
  };
}

interface EventEnquiryMessage {
  id: string;
  senderType: 'TRAINER' | 'ADMIN';
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'notifications' | 'send' | 'trainer-messages' | 'event-enquiries'>('contact');
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trainerMessages, setTrainerMessages] = useState<TrainerMessage[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [eventEnquiries, setEventEnquiries] = useState<EventEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [showEventEnquiryModal, setShowEventEnquiryModal] = useState(false);
  const [selectedEventEnquiry, setSelectedEventEnquiry] = useState<EventEnquiry | null>(null);
  const [eventEnquiryMessages, setEventEnquiryMessages] = useState<EventEnquiryMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [eventEnquiryReply, setEventEnquiryReply] = useState('');
  const [replyingToEnquiry, setReplyingToEnquiry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'unread' | 'read'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR',
    targetType: 'global' as 'global' | 'user' | 'role',
    userId: '',
    userRole: 'CLIENT' as 'CLIENT' | 'TRAINER' | 'ADMIN',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'contact') {
        const response = await apiClient.getContactSubmissions({ page: currentPage });
        setContactSubmissions(response.submissions || []);
        setTotalPages(response.totalPages || 1);
      } else if (activeTab === 'notifications') {
        const params: any = { page: currentPage };
        if (filterType !== 'all') {
          params.type = filterType;
        }
        const response = await apiClient.getNotifications(params);
        setNotifications(response.notifications || []);
        setTotalPages(response.totalPages || 1);
      } else if (activeTab === 'trainer-messages') {
        const params: any = { page: currentPage };
        if (filterType === 'unread') {
          params.isRead = false;
        } else if (filterType === 'read') {
          params.isRead = true;
        }
        const response = await apiClient.getTrainerMessages(params);
        setMessageThreads(response.threads || []);
        setTrainerMessages(response.legacyMessages || []); // For backward compatibility
        setTotalPages(response.totalPages || 1);
      } else if (activeTab === 'event-enquiries') {
        const params: any = { page: currentPage };
        if (filterType === 'unread') {
          params.isRead = false;
        } else if (filterType === 'read') {
          params.isRead = true;
        }
        const response = await apiClient.getEventEnquiries(params);
        setEventEnquiries(response.enquiries || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      showToast(error.message || 'Error fetching messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveContact = async (id: string) => {
    try {
      await apiClient.resolveContactSubmission(id);
      showToast('Contact submission marked as resolved', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error resolving submission', 'error');
    }
  };

  const handleSendNotification = async () => {
    try {
      const data: any = {
        title: sendForm.title,
        message: sendForm.message,
        type: sendForm.type,
      };

      if (sendForm.targetType === 'user' && sendForm.userId) {
        data.userId = sendForm.userId;
      } else if (sendForm.targetType === 'role') {
        data.userRole = sendForm.userRole;
      }

      await apiClient.sendNotification(data);
      showToast('Notification sent successfully', 'success');
      setShowSendModal(false);
      setSendForm({
        title: '',
        message: '',
        type: 'INFO',
        targetType: 'global',
        userId: '',
        userRole: 'CLIENT',
      });
      if (activeTab === 'notifications') {
        fetchData();
      }
    } catch (error: any) {
      showToast(error.message || 'Error sending notification', 'error');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      fetchData();
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await apiClient.deleteNotification(id);
      showToast('Notification deleted successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error deleting notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (searchTerm) {
      return (
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const filteredSubmissions = contactSubmissions.filter((sub) => {
    if (searchTerm) {
      return (
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'danger';
      default:
        return 'info';
    }
  };

  if (loading && (contactSubmissions.length === 0 && notifications.length === 0)) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Messages & Notifications</h1>
        <Button variant="primary" onClick={() => setShowSendModal(true)}>
          <Send size={20} className="mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'contact'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Mail size={18} className="inline mr-2" />
          Contact Submissions
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={18} className="inline mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('trainer-messages')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'trainer-messages'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={18} className="inline mr-2" />
          Messages from Trainer
        </button>
        <button
          onClick={() => setActiveTab('event-enquiries')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
            activeTab === 'event-enquiries'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={18} className="inline mr-2" />
          Enquiry about Event
          {eventEnquiries.filter(e => e.unreadCount > 0 || !e.isRead).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {eventEnquiries.filter(e => e.unreadCount > 0 || !e.isRead).length}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-4 flex items-center space-x-4">
          <div className="flex-1">
            <Input
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
            />
          </div>
          {activeTab === 'notifications' && (
            <Select
              label="Type"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'INFO', label: 'Info' },
                { value: 'WARNING', label: 'Warning' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'ERROR', label: 'Error' },
              ]}
            />
          )}
          {(activeTab === 'trainer-messages' || activeTab === 'event-enquiries') && (
            <Select
              label="Status"
              value={filterType === 'unread' || filterType === 'read' ? filterType : 'all'}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
                { value: 'read', label: 'Read' },
              ]}
            />
          )}
        </div>
      </Card>

      {/* Contact Submissions Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Mail className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No contact submissions found</p>
              </div>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{submission.name}</h3>
                        <Badge variant="info">{submission.email}</Badge>
                      </div>
                      {submission.phone && (
                        <p className="text-sm text-gray-600 mb-2">Phone: {submission.phone}</p>
                      )}
                      <p className="text-gray-700 mb-3">{submission.message}</p>
                      <p className="text-xs text-gray-500">
                        Received: {formatDate(submission.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResolveContact(submission.id)}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No notifications found</p>
              </div>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                        <Badge variant={getTypeBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="warning">Unread</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {notification.user && (
                          <span>To: {notification.user.fullName || notification.user.email}</span>
                        )}
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Trainer Messages Tab */}
      {activeTab === 'trainer-messages' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          ) : messageThreads.length === 0 && trainerMessages.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No messages from trainers</p>
              </div>
            </Card>
          ) : (
            <>
              {/* New Thread-based Messages */}
              {messageThreads
                .filter((thread) => {
                  if (searchTerm) {
                    return (
                      thread.trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      thread.trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (thread.lastMessage && thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                  }
                  return true;
                })
                .map((thread) => (
                  <Card key={thread.id} className={`hover:shadow-md transition-shadow ${
                    thread.unreadCount > 0 ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{thread.trainer.fullName}</h3>
                            <Badge variant="info">{thread.trainer.email}</Badge>
                            {thread.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white">
                                {thread.unreadCount} new
                              </Badge>
                            )}
                          </div>
                          {thread.lastMessage && (
                            <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-2">
                              {thread.lastMessage}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {thread.lastMessageTime && `Last: ${formatDate(thread.lastMessageTime)}`}
                            {thread.lastMessageBy && ` • ${thread.lastMessageBy === 'TRAINER' ? 'From trainer' : 'From admin'}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await apiClient.getTrainerThread(thread.trainerId);
                                setSelectedThread(response.thread || { ...thread, trainer: response.trainer });
                                setThreadMessages(response.messages || []);
                                setShowThreadModal(true);
                                fetchData();
                              } catch (error: any) {
                                showToast(error.message || 'Error loading conversation', 'error');
                              }
                            }}
                          >
                            <MessageSquare size={16} className="mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

              {/* Legacy Messages (for backward compatibility) */}
              {trainerMessages
                .filter((msg) => {
                  if (searchTerm) {
                    return (
                      msg.trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      msg.trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  }
                  return true;
                })
                .map((msg) => (
                  <Card key={msg.id} className={`hover:shadow-md transition-shadow ${
                    !msg.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{msg.trainer.fullName}</h3>
                            <Badge variant="info">{msg.trainer.email}</Badge>
                            {!msg.isRead && <Badge className="bg-blue-600 text-white">New</Badge>}
                          </div>
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{msg.lastMessage}</p>
                          <p className="text-xs text-gray-500">
                            Sent: {formatDate(msg.lastMessageTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              try {
                                // Get or create thread for this trainer
                                const response = await apiClient.getTrainerThread(msg.trainerId);
                                setSelectedThread(response.thread || { 
                                  id: '',
                                  trainerId: msg.trainerId,
                                  lastMessage: null,
                                  lastMessageTime: null,
                                  lastMessageBy: null,
                                  unreadCount: 0,
                                  trainer: response.trainer || msg.trainer
                                });
                                setThreadMessages(response.messages || []);
                                setShowThreadModal(true);
                                fetchData();
                              } catch (error: any) {
                                showToast(error.message || 'Error loading conversation', 'error');
                              }
                            }}
                          >
                            <MessageSquare size={16} className="mr-1" />
                            Reply
                          </Button>
                          {!msg.isRead && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await apiClient.markMessageAsRead(msg.id);
                                  showToast('Message marked as read', 'success');
                                  fetchData();
                                } catch (error: any) {
                                  showToast(error.message || 'Error marking message as read', 'error');
                                }
                              }}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Event Enquiries Tab */}
      {activeTab === 'event-enquiries' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          ) : eventEnquiries.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No event enquiries found</p>
              </div>
            </Card>
          ) : (
            eventEnquiries
              .filter((enquiry) => {
                if (searchTerm) {
                  return (
                    enquiry.trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    enquiry.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    enquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }
                return true;
              })
              .map((enquiry) => (
                <Card key={enquiry.id} className={`hover:shadow-md transition-shadow ${
                  enquiry.unreadCount > 0 || !enquiry.isRead ? 'border-l-4 border-l-green-500 bg-green-50' : ''
                }`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {enquiry.subject || 'Event Enquiry'}
                          </h3>
                          {(enquiry.unreadCount > 0 || !enquiry.isRead) && (
                            <Badge className="bg-green-600 text-white">
                              {enquiry.unreadCount > 0 ? `${enquiry.unreadCount} new` : 'New'}
                            </Badge>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Event:</span> {enquiry.event.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Date:</span> {formatDate(enquiry.event.eventDate)}
                          </p>
                          {enquiry.event.venue && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Venue:</span> {enquiry.event.venue}
                            </p>
                          )}
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">From:</span> {enquiry.trainer.fullName} ({enquiry.trainer.email})
                          </p>
                          {enquiry.messages && enquiry.messages.length > 0 ? (
                            <p className="text-gray-700 whitespace-pre-wrap line-clamp-2">
                              {enquiry.messages[0].message}
                            </p>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-wrap line-clamp-2">
                              {enquiry.message}
                            </p>
                          )}
                          {enquiry._count && enquiry._count.messages > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {enquiry._count.messages} message{enquiry._count.messages > 1 ? 's' : ''} in conversation
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {enquiry.lastMessageTime ? `Last: ${formatDate(enquiry.lastMessageTime)}` : `Received: ${formatDate(enquiry.createdAt)}`}
                          {enquiry.lastMessageBy && ` • ${enquiry.lastMessageBy === 'TRAINER' ? 'From trainer' : 'From admin'}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await apiClient.getEventEnquiryConversation(enquiry.id);
                              setSelectedEventEnquiry(response.enquiry);
                              setEventEnquiryMessages(response.messages || []);
                              setShowEventEnquiryModal(true);
                              fetchData();
                            } catch (error: any) {
                              showToast(error.message || 'Error loading conversation', 'error');
                            }
                          }}
                        >
                          <MessageSquare size={16} className="mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Notification"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={sendForm.title}
            onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
            placeholder="Notification title"
            required
          />

          <Textarea
            label="Message *"
            value={sendForm.message}
            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
            rows={4}
            placeholder="Notification message"
            required
          />

          <Select
            label="Type *"
            value={sendForm.type}
            onChange={(e) => setSendForm({ ...sendForm, type: e.target.value as any })}
            options={[
              { value: 'INFO', label: 'Info' },
              { value: 'WARNING', label: 'Warning' },
              { value: 'SUCCESS', label: 'Success' },
              { value: 'ERROR', label: 'Error' },
            ]}
          />

          <Select
            label="Send To *"
            value={sendForm.targetType}
            onChange={(e) => setSendForm({ ...sendForm, targetType: e.target.value as any })}
            options={[
              { value: 'global', label: 'All Users (Global)' },
              { value: 'role', label: 'All Users by Role' },
              { value: 'user', label: 'Specific User' },
            ]}
          />

          {sendForm.targetType === 'role' && (
            <Select
              label="User Role *"
              value={sendForm.userRole}
              onChange={(e) => setSendForm({ ...sendForm, userRole: e.target.value as any })}
              options={[
                { value: 'CLIENT', label: 'All Clients' },
                { value: 'TRAINER', label: 'All Trainers' },
                { value: 'ADMIN', label: 'All Admins' },
              ]}
            />
          )}

          {sendForm.targetType === 'user' && (
            <Input
              label="User ID *"
              value={sendForm.userId}
              onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
              placeholder="Enter user ID"
              required
            />
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendNotification}
              disabled={!sendForm.title || !sendForm.message}
            >
              <Send size={18} className="mr-2" />
              Send
            </Button>
          </div>
        </div>
      </Modal>

      {/* Thread Conversation Modal */}
      <Modal
        isOpen={showThreadModal}
        onClose={() => {
          setShowThreadModal(false);
          setSelectedThread(null);
          setThreadMessages([]);
          setReplyMessage('');
          fetchData();
        }}
        title={selectedThread ? `Conversation with ${selectedThread.trainer?.fullName || 'Trainer'}` : 'Conversation'}
        size="lg"
      >
        {selectedThread && (
          <div className="space-y-4">
            {/* Messages Display */}
            <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {threadMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No messages yet</p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const isAdmin = msg.senderType === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isAdmin
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {isAdmin ? 'You (Admin)' : 'Trainer'}
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
            </div>

            {/* Reply Form */}
            <div className="space-y-3">
              <Textarea
                label="Reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                disabled={replying}
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowThreadModal(false);
                    setSelectedThread(null);
                    setThreadMessages([]);
                    setReplyMessage('');
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!replyMessage.trim() || !selectedThread) return;
                    
                    try {
                      setReplying(true);
                      await apiClient.replyToTrainer(selectedThread.trainerId, replyMessage.trim());
                      showToast('Reply sent successfully', 'success');
                      setReplyMessage('');
                      
                      // Refresh thread messages
                      const response = await apiClient.getTrainerThread(selectedThread.trainerId);
                      setThreadMessages(response.messages || []);
                      fetchData();
                    } catch (error: any) {
                      showToast(error.message || 'Error sending reply', 'error');
                    } finally {
                      setReplying(false);
                    }
                  }}
                  disabled={!replyMessage.trim() || replying}
                >
                  <Send size={18} className="mr-2" />
                  {replying ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Event Enquiry Conversation Modal */}
      <Modal
        isOpen={showEventEnquiryModal}
        onClose={() => {
          setShowEventEnquiryModal(false);
          setSelectedEventEnquiry(null);
          setEventEnquiryMessages([]);
          setEventEnquiryReply('');
          fetchData();
        }}
        title={selectedEventEnquiry ? `Event Enquiry: ${selectedEventEnquiry.event.title}` : 'Event Enquiry Conversation'}
        size="lg"
      >
        {selectedEventEnquiry && (
          <div className="space-y-4">
            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedEventEnquiry.event.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Date:</span> {formatDate(selectedEventEnquiry.event.eventDate)}
                </div>
                {selectedEventEnquiry.event.venue && (
                  <div>
                    <span className="font-medium">Venue:</span> {selectedEventEnquiry.event.venue}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">From:</span> {selectedEventEnquiry.trainer.fullName} ({selectedEventEnquiry.trainer.email})
                </div>
              </div>
            </div>

            {/* Messages Display */}
            <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {eventEnquiryMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No messages yet</p>
                </div>
              ) : (
                eventEnquiryMessages.map((msg) => {
                  const isAdmin = msg.senderType === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isAdmin
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {isAdmin ? 'You (Admin)' : 'Trainer'}
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
            </div>

            {/* Reply Form */}
            <div className="space-y-3">
              <Textarea
                label="Reply"
                value={eventEnquiryReply}
                onChange={(e) => setEventEnquiryReply(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                disabled={replyingToEnquiry}
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEventEnquiryModal(false);
                    setSelectedEventEnquiry(null);
                    setEventEnquiryMessages([]);
                    setEventEnquiryReply('');
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!eventEnquiryReply.trim() || !selectedEventEnquiry) return;
                    
                    try {
                      setReplyingToEnquiry(true);
                      await apiClient.replyToEventEnquiry(selectedEventEnquiry.id, eventEnquiryReply.trim());
                      showToast('Reply sent successfully', 'success');
                      setEventEnquiryReply('');
                      
                      // Refresh conversation
                      const response = await apiClient.getEventEnquiryConversation(selectedEventEnquiry.id);
                      setEventEnquiryMessages(response.messages || []);
                      fetchData();
                    } catch (error: any) {
                      showToast(error.message || 'Error sending reply', 'error');
                    } finally {
                      setReplyingToEnquiry(false);
                    }
                  }}
                  disabled={!eventEnquiryReply.trim() || replyingToEnquiry}
                >
                  <Send size={18} className="mr-2" />
                  {replyingToEnquiry ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
