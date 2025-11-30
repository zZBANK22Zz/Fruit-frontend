import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "../../components/Card";
import Navbar from "../../components/Navbar";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon 
} from "@heroicons/react/24/outline";

export default function ProductPage() {
  const router = useRouter();
  const { category } = router.query;
  const [fruits, setFruits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fruits filtered by category
  useEffect(() => {
    const loadFruits = async () => {
      if (!category) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        if (!apiUrl) {
          console.error('API URL is not configured');
          setError('API URL is not configured');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/fruits?category=${encodeURIComponent(category)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.fruits) {
            setFruits(data.data.fruits);
          } else {
            setFruits([]);
          }
        } else {
          console.error('Failed to fetch fruits:', response.status);
          setError('Failed to load products');
          setFruits([]);
        }
      } catch (error) {
        console.error('Error loading fruits:', error);
        setError('Error loading products');
        setFruits([]);
      } finally {
        setLoading(false);
      }
    };

    loadFruits();
  }, [category]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white">
      {/* Top Header Section */}
      <Navbar showBackButton={true} />

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-sm sm:text-base transition-all duration-300 bg-white shadow-sm hover:shadow-md"
            />
          </div>
          
          {/* Filter Icon */}
          <button className="p-3 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md">
            <FunnelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Category Title */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            {category ? category : 'สินค้าทั้งหมด'}
          </h2>
        </div>
        {category && (
          <p className="text-sm sm:text-base text-gray-600 ml-4">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังโหลด...
              </span>
            ) : (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {fruits.length} รายการ
              </span>
            )}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-6 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-xl animate-pulse h-64"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : fruits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              ไม่พบสินค้าในหมวดหมู่นี้
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {fruits.map((fruit) => {
              // Convert base64 image to data URL if available
              const imageSrc = fruit.image 
                ? `data:image/jpeg;base64,${fruit.image}` 
                : '/images/example.jpg';
              return (
                <Card
                  key={fruit.id}
                  productId={fruit.id}
                  image={imageSrc}
                  name={fruit.name}
                  price={typeof fruit.price === 'number' ? fruit.price.toString() : fruit.price}
                  farmDirect={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

