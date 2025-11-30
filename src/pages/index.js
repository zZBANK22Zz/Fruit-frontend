import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState(["ทั้งหมด"]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const filterDropdownRef = useRef(null);

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

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        if (!apiUrl) {
          console.error('API URL is not configured');
          setProductsLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/fruits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.fruits) {
            setProducts(data.data.fruits);
          } else {
            setProducts([]);
          }
        } else {
          console.error('Failed to fetch products:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search query and category filter
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategoryFilter && selectedCategoryFilter !== "ทั้งหมด") {
      filtered = filtered.filter(product => 
        product.category_name === selectedCategoryFilter
      );
    }

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategoryFilter, products]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white">
      {/* Top Header Section */}
      <Navbar />

        {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-sm sm:text-base transition-all duration-300 bg-white shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Filter Icon with Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-3 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                selectedCategoryFilter 
                  ? "border-orange-400 bg-orange-50" 
                  : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
              }`}
            >
              <FunnelIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedCategoryFilter ? "text-orange-600" : "text-gray-600"}`} />
            </button>
            
            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden animate-slide-in-right">
                <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                  <h3 className="text-sm font-bold text-gray-900">กรองตามหมวดหมู่</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategoryFilter(category === "ทั้งหมด" ? "" : category);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        (category === "ทั้งหมด" && !selectedCategoryFilter) || selectedCategoryFilter === category
                          ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {category === "ทั้งหมด" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span>ทั้งหมด</span>
                        </>
                      ) : (
                        <>
                          <span className={`w-2 h-2 rounded-full ${selectedCategoryFilter === category ? "bg-orange-500" : "bg-gray-300"}`}></span>
                          <span>{category}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                {selectedCategoryFilter && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter("");
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      ล้างตัวกรอง
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(selectedCategoryFilter || searchQuery.trim() !== "") && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {selectedCategoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                หมวดหมู่: {selectedCategoryFilter}
                <button
                  onClick={() => setSelectedCategoryFilter("")}
                  className="hover:text-orange-900"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                ค้นหา: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-blue-900"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {(selectedCategoryFilter || searchQuery.trim() !== "") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryFilter("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium underline"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Section */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
          หมวดหมู่
        </h2>
        {categoriesLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-xl bg-gray-200 animate-pulse h-11 w-24"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
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
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-300"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Promotional Banner Slider */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="relative overflow-hidden rounded-2xl w-full shadow-xl">
          <div 
            className="flex flex-nowrap transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / promotionalImages.length)}%)`,
              width: `${promotionalImages.length * 100}%`
            }}
          >
            {promotionalImages.map((image, index) => (
              <div
                key={index}
                className="shrink-0 relative bg-gradient-to-br from-orange-100 to-orange-200"
                style={{ width: `${100 / promotionalImages.length}%` }}
              >
                <img
                  src={image}
                  alt={`Promotion ${index + 1}`}
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', image);
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          {promotionalImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              {promotionalImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 hover:scale-125 ${
                    currentSlide === index ? 'bg-orange-500 w-8 shadow-md shadow-orange-200' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
            {(searchQuery || selectedCategoryFilter) ? (
              <>
                ผลลัพธ์การค้นหา
                {(searchQuery || selectedCategoryFilter) && (
                  <span className="text-lg text-gray-600 font-normal">
                    ({filteredProducts.length} รายการ)
                  </span>
                )}
              </>
            ) : (
              "ผลไม้ยอดฮิต"
            )}
          </h2>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse border border-gray-100">
                <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4 sm:p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (searchQuery || selectedCategoryFilter) ? (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card
                    productId={product.id}
                    image={product.image ? `data:image/jpeg;base64,${product.image}` : '/images/example.jpg'}
                    name={product.name}
                    price={typeof product.price === 'number' ? product.price.toString() : product.price}
                    farmDirect={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">ไม่พบสินค้าที่ค้นหา</p>
              <p className="text-gray-500 text-sm mb-6">ลองค้นหาด้วยคำอื่นหรือล้างตัวกรอง</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryFilter("");
                }}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {popularFruits.map((fruit, index) => (
              <div 
                key={fruit.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  image={fruit.image}
                  name={fruit.name}
                  price={fruit.price}
                  farmDirect={fruit.farmDirect}
                  productId={fruit.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}