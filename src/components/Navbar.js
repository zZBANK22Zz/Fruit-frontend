import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { 
  UserIcon, 
  BellIcon, 
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import { getCartItemCount } from "../utils/cartUtils";
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  removeNotification 
} from "../utils/notificationUtils";
import { handleTokenExpiration } from "../utils/authUtils";

export default function Navbar({ showBackButton = false }) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user data from localStorage or API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, try to get user data from localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
          // Use first_name and last_name if available, otherwise use username
          const displayName = user.username;
          setUserName(displayName);
        } else if (token) {
          // If token exists but no user data, fetch from API
          const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
          if (apiUrl) {
            const response = await fetch(`${apiUrl}/api/users/profile`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.user) {
                const user = data.data.user;
                setUserData(user);
                localStorage.setItem('user', JSON.stringify(user));
                const displayName = user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || 'ผู้ใช้';
                setUserName(displayName);
              }
            } else if (response.status === 401) {
              // Unauthorized - token expired or invalid
              handleTokenExpiration(true, router.push);
              setUserName('ผู้ใช้');
            } else {
              // Token might be invalid, clear it (don't show warning for other errors)
              handleTokenExpiration(false);
              setUserName('ผู้ใช้');
            }
          }
        } else {
          // No user logged in
          setUserName('ผู้ใช้');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserName('ผู้ใช้');
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "สวัสดีตอนเช้า"; // Good morning
      } else if (hour >= 12 && hour < 18) {
        return "สวัสดีตอนบ่าย"; // Good afternoon
      } else {
        return "สวัสดีตอนเย็น"; // Good evening
      }
    };
    
    setGreeting(getGreeting());
    
    // Update greeting every minute (optional)
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Update cart item count
  useEffect(() => {
    const updateCartCount = () => {
      const count = getCartItemCount();
      setCartItemCount(count);
    };

    // Initial load
    updateCartCount();

    // Update cart count periodically to reflect changes from other tabs/components
    const cartInterval = setInterval(updateCartCount, 500);

    // Also update when window gains focus (user switches back to tab)
    const handleFocus = () => {
      updateCartCount();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(cartInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Listen for user data updates (e.g., when profile image is updated)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const updatedUser = JSON.parse(e.newValue);
          if (updatedUser) {
            setUserData(updatedUser);
            const displayName = updatedUser.first_name && updatedUser.last_name 
              ? `${updatedUser.first_name} ${updatedUser.last_name}`
              : updatedUser.username || 'ผู้ใช้';
            setUserName(displayName);
          }
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    // Listen for storage events (updates from other tabs/components)
    window.addEventListener('storage', handleStorageChange);

    // Also check localStorage periodically for same-tab updates
    const checkUserData = setInterval(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && (!userData || user.id !== userData.id || user.image !== userData?.image)) {
            setUserData(user);
            const displayName = user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user.username || 'ผู้ใช้';
            setUserName(displayName);
          }
        } catch (error) {
          console.error('Error checking user data:', error);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkUserData);
    };
  }, [userData]);

  // Load and update notifications
  useEffect(() => {
    const updateNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    };

    // Initial load
    updateNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      updateNotifications();
    };
    window.addEventListener('notificationsUpdated', handleNotificationUpdate);

    // Polling every 30 seconds for real-time experience
    const interval = setInterval(updateNotifications, 30000);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
      clearInterval(interval);
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    if (showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  const handleNotificationClick = async (notificationId) => {
    await markAsRead(notificationId);
    // After marking as read, refresh notifications
    const data = await getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Refresh notifications
    const data = await getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
  };

  const handleRemoveNotification = async (notificationId, e) => {
    e.stopPropagation();
    await removeNotification(notificationId);
    // Refresh notifications after removal
    const data = await getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle dropdown menu actions
  const handleProfileClick = () => {
    setShowDropdown(false);
    router.push('/profile');
  };

  const handleHistoryClick = () => {
    setShowDropdown(false);
    router.push('/bills/BillsListPage');
  };

  const handleAddProductClick = () => {
    setShowDropdown(false);
    router.push('/admin/products');
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Reset state
    setUserData(null);
    setUserName('ผู้ใช้');
    setShowDropdown(false);
    
    // Redirect to login page
    router.push('/registration/LoginPage');

    // line liff logout
    import('@line/liff').then((liff) => {
      if (liff.default.isLoggedIn()) {
        liff.default.logout();
      }
    }).catch(err => console.error('LIFF logout error:', err));
  };

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
      <div className="flex items-center justify-between mb-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-orange-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
          
          {/* Profile Picture with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden hover:from-orange-200 hover:to-orange-300 transition-all duration-300 cursor-pointer ring-2 ring-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
            >
              {userData?.image ? (
                <img 
                  src={`data:image/jpeg;base64,${userData.image}`} 
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.target.style.display = 'none';
                    const icon = e.target.parentElement.querySelector('.user-icon-fallback');
                    if (icon) icon.style.display = 'block';
                  }}
                />
              ) : null}
              <UserIcon 
                className={`w-8 h-8 sm:w-10 sm:h-10 text-gray-400 user-icon-fallback ${userData?.image ? 'hidden' : ''}`}
              />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slide-in-right">
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                    <UserIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                  </div>
                  <span className="group-hover:text-orange-600 transition-colors">โปรไฟล์</span>
                </button>
                <button
                  onClick={handleHistoryClick}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="group-hover:text-orange-600 transition-colors">ประวัติการสั่งซื้อ</span>
                </button>
                {/* Admin Only: Add Product Option */}
                {userData?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/admin/orders');
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <ShoppingCartIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="group-hover:text-orange-700 transition-colors">จัดการออเดอร์</span>
                    </button>
                    <button
                      onClick={handleAddProductClick}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <PlusCircleIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="group-hover:text-blue-700 transition-colors">จัดการสินค้า</span>
                    </button>
                  </>
                )}
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="group-hover:text-red-700 transition-colors">ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
          
          {/* User Name and Greeting */}
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">สวัสดี {userName}</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{greeting}</p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell Icon */}
          <div className="relative" ref={notificationDropdownRef}>
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <BellIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h3 className="font-semibold text-gray-800">การแจ้งเตือน</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-80">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatTimestamp(notification.timestamp || notification.created_at)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleRemoveNotification(notification.id, e)}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart Icon */}
          <button 
            onClick={() => router.push('/cart/CartPage')}
            className="relative p-2 text-gray-600 hover:text-gray-800"
          >
            <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            {/* Cart Badge */}
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

