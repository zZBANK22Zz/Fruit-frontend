/**
 * Notification utility functions for managing notifications
 */

const NOTIFICATION_STORAGE_KEY = 'notifications';

/**
 * Get all notifications
 * @returns {Array} Array of notifications
 */
export const getNotifications = () => {
  if (typeof window === 'undefined') return [];
  try {
    const notifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Add a new notification
 * @param {Object} notification - Notification object with type, title, message, etc.
 */
export const addNotification = (notification) => {
  try {
    const notifications = getNotifications();
    const newNotification = {
      id: Date.now().toString(),
      type: notification.type || 'info', // 'success', 'error', 'info', 'warning'
      title: notification.title || '',
      message: notification.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    // Add to beginning of array (newest first)
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    const maxNotifications = 50;
    if (notifications.length > maxNotifications) {
      notifications.splice(maxNotifications);
    }
    
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    
    // Dispatch custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return notifications;
  } catch (error) {
    console.error('Error adding notification:', error);
    return getNotifications();
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - ID of notification to mark as read
 */
export const markAsRead = (notificationId) => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return updatedNotifications;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return getNotifications();
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = () => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return updatedNotifications;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return getNotifications();
  }
};

/**
 * Remove a notification
 * @param {string} notificationId - ID of notification to remove
 */
export const removeNotification = (notificationId) => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return updatedNotifications;
  } catch (error) {
    console.error('Error removing notification:', error);
    return getNotifications();
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
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = () => {
  const notifications = getNotifications();
  return notifications.filter(notif => !notif.read).length;
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

