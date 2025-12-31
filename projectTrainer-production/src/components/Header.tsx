import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCounts();
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Refresh counts when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        fetchUnreadCounts();
      }
    };

    // Listen for custom events to refresh counts
    const handleNotificationRead = () => {
      fetchUnreadCounts();
    };
    const handleMessageRead = () => {
      fetchUnreadCounts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('notification:read', handleNotificationRead);
    document.addEventListener('message:read', handleMessageRead);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('notification:read', handleNotificationRead);
      document.removeEventListener('message:read', handleMessageRead);
    };
  }, [user?.id]);

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;

    try {
      // Fetch unread notifications count
      setLoadingNotifications(true);
      const notificationsResponse = await apiClient.getNotifications({ page: 1 });
      // Filter unread notifications from the response
      const unreadNotificationsCount = notificationsResponse.notifications?.filter((n: any) => !n.isRead).length || 0;
      setUnreadNotifications(unreadNotificationsCount);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }

    try {
      // Fetch unread messages count
      setLoadingMessages(true);
      const messagesResponse = await apiClient.getMessageThread();
      const unreadMessagesCount = messagesResponse.thread?.unreadCount || 0;
      setUnreadMessages(unreadMessagesCount);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-end px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Messages Icon */}
        <button
          onClick={() => navigate('/messages')}
          className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors"
          title={`Messages${unreadMessages > 0 ? ` (${unreadMessages} unread)` : ''}`}
        >
          <MessageSquare className="w-6 h-6" />
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors"
          title={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
        >
          <Bell className="w-6 h-6" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </header>
  );
}

