import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserIcon, 
  BellIcon, 
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  HomeIcon,
  GlobeAltIcon
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
import { useLanguage } from "../utils/LanguageContext";

export default function Navbar({ showBackButton = false }) {
  const router = useRouter();
  const { lang, toggleLang, t } = useLanguage();
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
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
          setUserName(user.username);
        } else if (token) {
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
                  : user.username || t('defaultUser');
                setUserName(displayName);
              }
            } else if (response.status === 401) {
              handleTokenExpiration(true, router.push);
              setUserName(t('defaultUser'));
            } else {
              handleTokenExpiration(false);
              setUserName(t('defaultUser'));
            }
          }
        } else {
          setUserName(t('defaultUser'));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserName(t('defaultUser'));
      }
    };

    loadUserData();
  }, []);

  // Update greeting when language or time changes
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return t('greetingMorning');
      } else if (hour >= 12 && hour < 18) {
        return t('greetingAfternoon');
      } else {
        return t('greetingEvening');
      }
    };
    
    setGreeting(getGreeting());
    
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [lang]); // re-run when language changes

  // Update cart item count
  useEffect(() => {
    const updateCartCount = () => {
      const count = getCartItemCount();
      setCartItemCount(count);
    };

    updateCartCount();
    const cartInterval = setInterval(updateCartCount, 500);
    const handleFocus = () => updateCartCount();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(cartInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Listen for user data updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const updatedUser = JSON.parse(e.newValue);
          if (updatedUser) {
            setUserData(updatedUser);
            const displayName = updatedUser.first_name && updatedUser.last_name 
              ? `${updatedUser.first_name} ${updatedUser.last_name}`
              : updatedUser.username || t('defaultUser');
            setUserName(displayName);
          }
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const checkUserData = setInterval(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && (!userData || user.id !== userData.id || user.image !== userData?.image)) {
            setUserData(user);
            const displayName = user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user.username || t('defaultUser');
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

    updateNotifications();

    const handleNotificationUpdate = () => updateNotifications();
    window.addEventListener('notificationsUpdated', handleNotificationUpdate);
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
    const data = await getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    const data = await getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
  };

  const handleRemoveNotification = async (notificationId, e) => {
    e.stopPropagation();
    await removeNotification(notificationId);
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

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', diffMins);
    if (diffHours < 24) return t('hoursAgo', diffHours);
    if (diffDays < 7) return t('daysAgo', diffDays);
    return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB');
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    setUserData(null);
    setUserName(t('defaultUser'));
    setShowDropdown(false);
    
    router.push('/registration/LoginPage');

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
                  <span className="group-hover:text-orange-600 transition-colors">{t('profile')}</span>
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
                  <span className="group-hover:text-orange-600 transition-colors">{t('orderHistory')}</span>
                </button>
                {/* Admin Only */}
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
                      <span className="group-hover:text-orange-700 transition-colors">{t('manageOrders')}</span>
                    </button>
                    <button
                      onClick={handleAddProductClick}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <PlusCircleIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="group-hover:text-blue-700 transition-colors">{t('manageProducts')}</span>
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
                  <span className="group-hover:text-red-700 transition-colors">{t('logout')}</span>
                </button>
              </div>
            )}
          </div>
          
          {/* User Name and Greeting */}
          <div 
            onClick={() => router.push('/')}
            className="flex flex-col cursor-pointer group"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
              {userName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium group-hover:text-orange-400 transition-colors">{greeting}</p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Home Icon */}
          <button 
            onClick={() => router.push('/')}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            title={t('home')}
          >
            <HomeIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Language Toggle Button */}
          <motion.button
            onClick={toggleLang}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 shadow-sm"
            title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            {/* <GlobeAltIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> */}
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-bold text-orange-600 min-w-[40px] text-center"
              >
                {lang === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Notification Bell Icon */}
          <div className="relative" ref={notificationDropdownRef}>
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <motion.div
                animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ 
                    duration: 0.5, 
                    repeat: unreadCount > 0 ? Infinity : 0, 
                    repeatDelay: 5 
                }}
              >
                  <BellIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.div>
              {/* Notification Badge */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {showNotificationDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[32rem] overflow-hidden flex flex-col ring-1 ring-black/5"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <BellIcon className="w-5 h-5 text-orange-500" />
                        <h3 className="font-bold text-gray-900 text-sm">{t('notifications')}</h3>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline underline-offset-2 transition-all"
                        >
                          {t('markAllRead')}
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[24rem] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <BellIcon className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm">{t('noNotifications')}</p>
                          <p className="text-gray-400 text-xs mt-1">{t('notifyWhenUpdate')}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              onClick={() => handleNotificationClick(notification.id)}
                              className={`px-5 py-4 hover:bg-orange-50/50 cursor-pointer transition-colors relative group ${
                                !notification.read ? 'bg-orange-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 mt-1 p-2 rounded-full ${
                                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className={`text-sm font-semibold mb-1 ${
                                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                                        <span>{formatTimestamp(notification.timestamp || notification.created_at)}</span>
                                      </p>
                                    </div>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse shadow-sm shadow-orange-500/50"></div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => handleRemoveNotification(notification.id, e)}
                                  className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Shopping Cart Icon */}
          <button 
            onClick={() => router.push('/cart/CartPage')}
            className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
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

