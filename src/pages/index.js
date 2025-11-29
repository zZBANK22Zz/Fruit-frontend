import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon 
} from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState(["ทั้งหมด"]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [currentSlide, setCurrentSlide] = useState(0);

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


  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        if (!apiUrl) {
          console.error('API URL is not configured');
          // Fallback to default categories
          setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สัปรด", "แก้วมังกร"]);
          setCategoriesLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.categories) {
            // Extract category names and add "ทั้งหมด" at the beginning
            const categoryNames = data.data.categories.map(cat => cat.name);
            setCategories(["ทั้งหมด", ...categoryNames]);
          } else {
            // Fallback if response structure is different
            setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สัปรด", "แก้วมังกร"]);
          }
        } else {
          console.error('Failed to fetch categories:', response.status);
          // Fallback to default categories
          setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สัปรด", "แก้วมังกร"]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories
        setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สัปรด", "แก้วมังกร"]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
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
      <Navbar />

        {/* Search Bar */}
      <div className="bg-white px-4 sm:px-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-400 text-sm sm:text-base"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          {/* Filter Icon */}
          <button className="p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-orange-400">
            <FunnelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Category Section */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">หมวดหมู่</h2>
        {categoriesLoading ? (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gray-200 animate-pulse h-10 w-20"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  if (category === "ทั้งหมด") {
                    setSelectedCategory(category);
                  } else {
                    // Navigate to ProductPage with category filter
                    router.push(`/products/ProductPage?category=${encodeURIComponent(category)}`);
                  }
                }}
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
        )}
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