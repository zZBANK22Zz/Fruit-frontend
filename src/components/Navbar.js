import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  UserIcon, 
  BellIcon, 
  ShoppingCartIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { getCartItemCount } from "../utils/cartUtils";

export default function Navbar({ showBackButton = false }) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

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
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUserName('ผู้ใช้');
            } else {
              // Token might be invalid, clear it
              localStorage.removeItem('token');
              localStorage.removeItem('user');
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

  return (
    <div className="bg-white px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
          
          {/* Profile Picture */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          
          {/* User Name and Greeting */}
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold text-black">สวัสดี {userName}</h2>
            <p className="text-xs sm:text-sm text-gray-600">{greeting}</p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell Icon */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800">
            <BellIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            {/* Notification Badge */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>

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

