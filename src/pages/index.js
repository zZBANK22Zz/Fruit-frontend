import { useState, useEffect } from "react";
import Card from "../components/Card";

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [userName] = useState("สมหญิง"); // You can make this dynamic later
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    "ทั้งหมด",
    "กล้วย",
    "แตงโม",
    "ส้ม",
    "มะละกอ",
    "สัปรด",
    "แก้วมังกร"
  ];

  // Promotional banner images - update these paths with your actual image filenames
  const promotionalImages = [
    "/images/example.jpg",
    "/images/แก้วมังกร.jpg",
    "/images/example.jpg"
  ];

  // Popular fruits data
  const popularFruits = [
    {
      id: 1,
      name: "มะละกอ",
      price: "20",
      image: "/images/example.jpg",
      farmDirect: true
    },
    {
      id: 2,
      name: "แก้วมังกร",
      price: "50",
      image: "/images/แก้วมังกร.jpg",
      farmDirect: true
    },
    {
      id: 3,
      name: "กล้วย",
      price: "15",
      image: "/images/example.jpg",
      farmDirect: true
    },
    {
      id: 4,
      name: "แตงโม",
      price: "30",
      image: "/images/example.jpg",
      farmDirect: true
    }
  ];

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

  // Auto-slide functionality for promotional banner
  useEffect(() => {
    if (promotionalImages.length > 1) {
      const slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promotionalImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(slideInterval);
    }
  }, [promotionalImages.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header Section */}
      <div className="bg-white px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
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
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Shopping Cart Icon */}
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Cart Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-400 text-sm sm:text-base"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filter Icon */}
          <button className="p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-orange-400">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Section */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">หมวดหมู่</h2>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Promotional Banner Slider */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-xl w-full">
          <div 
            className="flex flex-nowrap transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / promotionalImages.length)}%)`,
              width: `${promotionalImages.length * 100}%`
            }}
          >
            {promotionalImages.map((image, index) => (
              <div
                key={index}
                className="shrink-0 relative bg-gray-100"
                style={{ width: `${100 / promotionalImages.length}%` }}
              >
                <img
                  src={image}
                  alt={`Promotion ${index + 1}`}
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-xl"
                  onError={(e) => {
                    console.error('Image failed to load:', image);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          {promotionalImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {promotionalImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-orange-500 w-6' : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Fruits Section */}
      <div className="px-4 sm:px-6 pb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-4 sm:mb-6">
          ผลไม้ยอดฮิต
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {popularFruits.map((fruit) => (
            <Card
              key={fruit.id}
              image={fruit.image}
              name={fruit.name}
              price={fruit.price}
              farmDirect={fruit.farmDirect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}