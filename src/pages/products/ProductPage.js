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
    <div className="min-h-screen bg-white">
      {/* Top Header Section */}
      <Navbar showBackButton={true} />

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

      {/* Category Title */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2">
          {category ? `หมวดหมู่: ${category}` : 'สินค้าทั้งหมด'}
        </h2>
        {category && (
          <p className="text-sm sm:text-base text-gray-600">
            {loading ? 'กำลังโหลด...' : `${fruits.length} รายการ`}
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
            {fruits.map((fruit) => (
              <Card
                key={fruit.id}
                productId={fruit.id}
                image={fruit.image_url || '/images/example.jpg'}
                name={fruit.name}
                price={typeof fruit.price === 'number' ? fruit.price.toString() : fruit.price}
                farmDirect={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

