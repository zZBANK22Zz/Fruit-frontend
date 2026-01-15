/**
 * Notification utility functions for managing notifications
 */

const NOTIFICATION_STORAGE_KEY = 'notifications';

/**
 * Get all notifications from backend
 * @returns {Promise<Object>} Object containing notifications array and unread_count
 */
export const getNotifications = async () => {
  if (typeof window === 'undefined') return { notifications: [], unread_count: 0 };
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) return { notifications: [], unread_count: 0 };

    const response = await fetch(`${apiUrl}/api/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        notifications: data.data?.notifications || [],
        unread_count: data.data?.unread_count || 0
      };
    }
    return { notifications: [], unread_count: 0 };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { notifications: [], unread_count: 0 };
  }
};

/**
 * Add a local notification (legacy support or internal app alerts)
 * @param {Object} notification - Notification object
 */
export const addNotification = (notification) => {
  // Keeping this for local UI feedback if needed, but primary notifications come from backend
  try {
    const existing = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const notifications = existing ? JSON.parse(existing) : [];
    const newNotification = {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    notifications.unshift(newNotification);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    return notifications;
  } catch (error) {
    console.error('Error adding notification:', error);
    return [];
  }
};

/**
 * Mark notification as read on backend
 * @param {string} notificationId - ID of notification to mark as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) return;

    await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Mark all notifications as read on backend
 */
export const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) return;

    await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

/**
 * Remove a notification (Local only for now, as backend removal isn't specified)
 * @param {string} notificationId - ID of notification to remove
 */
export const removeNotification = async (notificationId) => {
  try {
    const { notifications } = await getNotifications();
    if (!Array.isArray(notifications)) return [];
    
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    
    // If it's a local notification, remove from local storage
    const existingLocal = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (existingLocal) {
      const localNotifs = JSON.parse(existingLocal);
      const filteredLocal = localNotifs.filter(notif => notif.id !== notificationId);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filteredLocal));
    }
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return updatedNotifications;
  } catch (error) {
    console.error('Error removing notification:', error);
    return [];
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  try {
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return [];
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return getNotifications();
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadCount = async () => {
  const { unread_count } = await getNotifications();
  return unread_count;
};

/**
 * Helper function to add success notification
 */
export const notifySuccess = (title, message) => {
  return addNotification({ type: 'success', title, message });
};

/**
 * Helper function to add error notification
 */
export const notifyError = (title, message) => {
  return addNotification({ type: 'error', title, message });
};

/**
 * Helper function to add info notification
 */
export const notifyInfo = (title, message) => {
  return addNotification({ type: 'info', title, message });
};

