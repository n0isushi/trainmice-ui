import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../lib/api-client';
import { Bell, AlertCircle, FileWarning, Calendar } from 'lucide-react';
import { Badge } from './Badge';

interface Notification {
  id: string;
  type: 'certificate_expiry' | 'import_failed' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  severity: 'info' | 'warning' | 'error';
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const today = new Date().toISOString().split('T')[0];

      // Fetch expiring documents
      const documentsResponse = await apiClient.getAdminDocuments();
      const expiringDocs = (documentsResponse.documents || []).filter((doc: any) => {
        if (!doc.expiresAt) return false;
        const expiryDate = new Date(doc.expiresAt);
        const todayDate = new Date(today);
        return expiryDate >= todayDate && expiryDate <= thirtyDaysFromNow;
      });

      // Fetch pending confirmations from bookings
      const bookingsResponse = await apiClient.getBookings();
      const pendingConfirmations = (bookingsResponse.bookings || []).filter((booking: any) => {
        if (booking.status !== 'CONFIRMED') return false;
        if (booking.finalConfirmation) return false;
        const bookingDate = new Date(booking.bookingDate || booking.startDate);
        return bookingDate >= new Date(today);
      });

      const systemNotifications: Notification[] = [];

      expiringDocs.forEach((doc: any) => {
        const expiryDate = new Date(doc.expiresAt);
        const daysUntil = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        systemNotifications.push({
          id: `cert-${doc.id}`,
          type: 'certificate_expiry',
          title: 'Certificate Expiring Soon',
          message: `${doc.trainer?.fullName || 'Trainer'}'s ${doc.documentType} expires in ${daysUntil} days`,
          timestamp: new Date().toISOString(),
          is_read: false,
          severity: daysUntil <= 7 ? 'error' : 'warning',
        });
      });

      pendingConfirmations.forEach((booking: any) => {
        const bookingDate = new Date(booking.bookingDate || booking.startDate);
        const daysUntil = Math.ceil((bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        systemNotifications.push({
          id: `confirm-${booking.id}`,
          type: 'reminder',
          title: 'Final Confirmation Needed',
          message: `${booking.course?.title || 'Course'} with ${booking.trainer?.fullName || 'Trainer'} in ${daysUntil} days needs final confirmation`,
          timestamp: new Date().toISOString(),
          is_read: false,
          severity: daysUntil <= 2 ? 'error' : 'warning',
        });
      });

      systemNotifications.sort((a, b) => {
        if (a.severity === 'error' && b.severity !== 'error') return -1;
        if (a.severity !== 'error' && b.severity === 'error') return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setNotifications(systemNotifications);
      setUnreadCount(systemNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate_expiry':
        return <FileWarning size={20} className="text-yellow-600" />;
      case 'import_failed':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'reminder':
        return <Calendar size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-800">System Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="danger">{unreadCount} New</Badge>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getSeverityColor(notification.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  fetchNotifications();
                }}
                className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Refresh Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
