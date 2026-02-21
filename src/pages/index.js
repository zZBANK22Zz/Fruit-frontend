import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Search, ShoppingBag, ChevronRight, ChevronLeft, Filter, Sparkles, Star, Zap } from "lucide-react";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { getImagePath } from "../utils/imageUtils";
import { getCategoryIcon } from "../utils/categoryIcons";

// 3D Tilt Card Component for Hero
function TiltHero({ image, active }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: active ? rotateX : 0,
        rotateY: active ? rotateY : 0,
        filter: active ? `brightness(${brightness})` : "brightness(1)",
        transformStyle: "preserve-3d",
      }}
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-[2.5rem] overflow-visible perspective-1000 cursor-pointer"
    >
      <motion.div 
        style={{ transform: "translateZ(20px)" }}
        className="absolute inset-4 rounded-[2rem] shadow-2xl shadow-orange-500/30 overflow-hidden bg-black"
      >
         <img
          src={image}
          alt="Hero"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 to-transparent" />
      </motion.div>
      
      {/* Floating Elements */}
      <motion.div 
        style={{ transform: "translateZ(60px)" }}
        className="absolute bottom-12 left-8 md:bottom-20 md:left-16 z-20 pointer-events-none"
      >
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl"
         >
            <div className="flex items-center gap-2 mb-2 text-orange-300">
              <Sparkles className="w-5 h-5 fill-current animate-pulse" />
              <span className="text-sm font-bold tracking-widest uppercase">คุณภาพเกรดพรีเมียม</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
              สดใหม่ & <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">ฉ่ำหวาน</span>
            </h2>
         </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState(["ทั้งหมด"]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  // Parallax Scroll Effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);

  // Promotional banner images
  const promotionalImages = [
    getImagePath("/images/promotion1.png"),
    getImagePath("/images/promotion2.png"),
    getImagePath("/images/promotion3.png"),
  ];

  const defaultPopularFruits = [
    { id: 1, name: "มะละกอ", price: "20", image: getImagePath("/images/example.jpg"), farmDirect: true },
    { id: 2, name: "แก้วมังกร", price: "50", image: getImagePath("/images/แก้วมังกร.jpg"), farmDirect: true },
    { id: 3, name: "กล้วย", price: "15", image: getImagePath("/images/example.jpg"), farmDirect: true },
    { id: 4, name: "แตงโม", price: "30", image: getImagePath("/images/example.jpg"), farmDirect: true }
  ];

  const [popularFruits, setPopularFruits] = useState(defaultPopularFruits);
  const [popularFruitsLoading, setPopularFruitsLoading] = useState(true);
  const [isShowingUserProducts, setIsShowingUserProducts] = useState(false);

  // Data Fetching Logic (Same as before)
  useEffect(() => {
    // ... (Keep existing fetch logic for categories, products, and popular fruits)
    // For brevity, assuming the same logic is here. 
    // Implementing inline to ensure functionality.
    
    // Categories
    const loadCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        if (!apiUrl) {
          setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สับปะรด", "แก้วมังกร"]);
          setCategoriesLoading(false); return;
        }
        const response = await fetch(`${apiUrl}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.categories) setCategories(["ทั้งหมด", ...data.data.categories.map(c => c.name)]);
          else setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สับปะรด", "แก้วมังกร"]);
        } else setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สับปะรด", "แก้วมังกร"]);
      } catch (e) { setCategories(["ทั้งหมด", "กล้วย", "แตงโม", "ส้ม", "มะละกอ", "สับปะรด", "แก้วมังกร"]); }
      finally { setCategoriesLoading(false); }
    };
    loadCategories();

    // Products
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        if (!apiUrl) { setProductsLoading(false); return; }
        const response = await fetch(`${apiUrl}/api/fruits`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.fruits) {
            setProducts(data.data.fruits);
            setAllProducts(data.data.fruits.map(p => ({
              id: p.id, name: p.name, price: typeof p.price === 'number' ? p.price.toString() : p.price,
              image: p.image ? `data:image/jpeg;base64,${p.image}` : '/images/example.jpg',
              farmDirect: true, unit: p.unit || 'kg', stock: p.stock
            })));
          }
        }
      } catch (e) { console.error(e); } finally { setProductsLoading(false); }
    };
    loadProducts();

    // Popular Fruits
    // Popular Fruits (Global Best Sellers)
    const loadPopular = async () => {
      try {
        setPopularFruitsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        if (!apiUrl) { 
            setPopularFruits(defaultPopularFruits); 
            return; 
        }

        // Now public endpoint, no token needed
        const res = await fetch(`${apiUrl}/api/orders/most-bought?limit=5`);

        if (res.ok) {
            const data = await res.json();
            if (data.data?.products?.length > 0) {
                setPopularFruits(data.data.products.map(p => ({
                    id: p.id, 
                    name: p.name, 
                    price: p.price,
                    image: p.image ? `data:image/jpeg;base64,${p.image}` : '/images/example.jpg',
                    farmDirect: true, 
                    unit: p.unit || 'kg',
                    stock: p.stock
                })));
                // Always show for everyone now
                setIsShowingUserProducts(true);
            } else {
                setPopularFruits(defaultPopularFruits);
            }
        } else {
            console.error("Failed to fetch popular products:", res.status);
            setPopularFruits(defaultPopularFruits);
        }
      } catch (e) { 
        console.error("Error fetching popular products:", e);
        setPopularFruits(defaultPopularFruits); 
      } finally { 
        setPopularFruitsLoading(false); 
      }
    };
    loadPopular();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategoryFilter && selectedCategoryFilter !== "ทั้งหมด") {
      filtered = filtered.filter(p => p.category_name === selectedCategoryFilter);
    }
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategoryFilter, products]);

  useEffect(() => {
    if (promotionalImages.length > 1) {
      const interval = setInterval(() => setCurrentSlide(p => (p + 1) % promotionalImages.length), 5000);
      return () => clearInterval(interval);
    }
  }, [promotionalImages.length]);

  return (
    <div className="min-h-screen bg-orange-50/30 text-gray-900 selection:bg-orange-100 selection:text-orange-900 font-sans">
      
      {/* Sticky Clean Navbar */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-gray-100 supports-[backdrop-filter]:bg-[#FAFAFA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="py-4">
                <Navbar />
                <div className="mt-4 pb-2">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategoryFilter={selectedCategoryFilter}
                        setSelectedCategoryFilter={setSelectedCategoryFilter}
                        categories={categories}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-12 sm:space-y-20">
        
        {/* Playful Marquee */}
        <div className="relative overflow-hidden bg-orange-50/50 rounded-2xl py-3 border border-orange-100">
            <motion.div 
                className="flex whitespace-nowrap text-orange-800 font-medium text-sm sm:text-base"
                animate={{ x: "-50%" }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="flex items-center gap-4 mr-8">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        🍎 ผลไม้เกรดพรีเมียม ส่งตรงจากสวน 🚜
                        <span className="text-orange-300">•</span>
                        ✨ รับประกันความสดใหม่ 🌿
                        <span className="text-orange-300">•</span>
                        🚚 จัดส่งทั่วภูเก็ต 🇹🇭
                        <span className="text-orange-300">•</span>
                        <a 
                            href="https://lin.ee/vRVh8xp" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#06C755] text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-[#05b34c] transition-colors shadow-sm cursor-pointer no-underline flex items-center gap-1"
                        >
                            💬 Add Line เลย! ✨
                        </a>
                    </span>
                ))}
            </motion.div>
        </div>
        
        {/* Minimal Hero Section */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[21/9] bg-gray-100 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    <img
                      src={promotionalImages[currentSlide]}
                      alt="Promotion"
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                </motion.div>
            </AnimatePresence>
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-12 text-white z-10 w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl sm:text-6xl font-medium tracking-tight mb-2 leading-tight">
                        สดใหม่จากสวน
                    </h2>
                    <p className="text-sm sm:text-xl text-white/90 font-light max-w-md">
                        คัดสรรผลไม้เกรดพรีเมียม เพื่อสุขภาพที่ดีของคุณ
                    </p>
                </motion.div>
            </div>

            {/* Micro-interaction: Slideshow Indicators */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 flex gap-2 z-20">
                {promotionalImages.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentSlide ? "w-6 sm:w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>

        {/* Clean Categories - Grab Style */}
        <section>
            <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">หมวดหมู่สินค้า</h2>
                <button 
                    onClick={() => setSelectedCategory("ทั้งหมด")}
                    className="text-xs sm:text-sm text-orange-600 font-medium hover:underline"
                >
                    ดูทั้งหมด
                </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pt-4 pb-6 scrollbar-hide snap-x px-2 -mx-2">
                {categoriesLoading 
                    ? [1,2,3,4,5,6].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 snap-start">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full animate-pulse" />
                            <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))
                    : categories.map((cat, i) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => {
                                    if (cat === "ทั้งหมด") setSelectedCategory(cat);
                                    else router.push(`/products/ProductPage?category=${encodeURIComponent(cat)}`);
                                }}
                                className="group flex flex-col items-center gap-2 flex-shrink-0 snap-start transition-all duration-300 transform active:scale-95"
                            >
                                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isSelected 
                                    ? 'bg-orange-100 ring-2 ring-orange-500 shadow-lg shadow-orange-500/20 scale-110' 
                                    : 'bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 hover:scale-105'
                                }`}>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:rotate-6">
                                        {getCategoryIcon(cat)}
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="activeCategoryDot"
                                            className="absolute -bottom-1 w-2 h-2 bg-orange-500 rounded-full"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </div>
                                <span className={`text-xs sm:text-sm font-medium transition-colors ${
                                    isSelected ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-900'
                                }`}>
                                    {cat}
                                </span>
                            </button>
                        );
                    })
                }
            </div>
        </section>

        {/* Products Grid - Clean & Minimal */}
        <section id="products-section" className="min-h-[50vh]">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                 <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                    {(searchQuery || selectedCategoryFilter) ? "ผลการค้นหา" : "ยอดนิยม"}
                </h2>
                {(searchQuery || selectedCategoryFilter) && (
                     <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                        {filteredProducts.length} รายการ
                     </span>
                )}
            </div>

            <motion.div 
                layout
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 gap-y-6 sm:gap-y-10"
            >
                <AnimatePresence>
                    {(searchQuery || selectedCategoryFilter ? filteredProducts : popularFruits).map((item, i) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                            transition={{ 
                                opacity: { duration: 0.4, delay: i * 0.05 },
                                default: { type: "spring", stiffness: 300, damping: 20 }
                            }}
                            className={`group cursor-pointer ${item.stock <= 0 ? 'opacity-60 pointer-events-none' : ''}`}
                            onClick={() => router.push(`/products/${item.id}`)}
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                                <img 
                                    src={item.image ? (item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`) : '/images/example.jpg'} 
                                    alt={item.name}
                                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${item.stock > 0 ? 'group-hover:scale-105' : 'grayscale'}`}
                                />
                                {item.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-lg font-bold text-sm tracking-wide">
                                            สินค้าหมด
                                        </span>
                                    </div>
                                )}
                                {/* Hidden UX: Quick Add Button appears on hover */}
                                {item.stock > 0 && (
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/products/${item.id}`);
                                            }}
                                            className="w-full py-3 bg-white/90 backdrop-blur text-gray-900 font-medium text-sm rounded-xl shadow-lg hover:bg-white hover:text-orange-600 hover:shadow-orange-500/20 transition-all"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                )}
                                {/* Shine Effect */}
                                <div className="absolute inset-0 skew-x-12 pointer-events-none opacity-0 group-hover:opacity-100 overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-900 text-base group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <span className="font-semibold text-gray-900">
                                        ฿{item.price}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-light flex items-center gap-1">
                                    {item.farmDirect && <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded">จากสวน</span>}
                                    <span>/ {item.unit || 'กก.'}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {(searchQuery || selectedCategoryFilter) && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">ไม่พบสินค้า</p>
                    <p className="text-gray-500 text-sm mb-6">ลองค้นหาด้วยคำใหม่</p>
                    <button 
                        onClick={() => { setSearchQuery(""); setSelectedCategoryFilter(""); }}
                        className="text-sm text-black underline underline-offset-4 hover:text-orange-600 transition-colors"
                    >
                        ล้างการค้นหา
                    </button>
                </div>
            )}
        </section>

        {/* All Products Section - Clean List */}
        {!(searchQuery || selectedCategoryFilter) && !productsLoading && allProducts.length > 0 && (
            <section className="pt-10 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">สินค้าทั้งหมด</h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 gap-y-6 sm:gap-y-10">
                     {allProducts.map((item, i) => (
                        <div
                            key={`all-${item.id}`}
                             className={`group cursor-pointer ${item.stock <= 0 ? 'opacity-60 pointer-events-none' : ''}`}
                             onClick={() => router.push(`/products/${item.id}`)}
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-500">
                                <img 
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className={`w-full h-full object-cover transition-transform duration-500 ${item.stock > 0 ? 'group-hover:scale-105' : 'grayscale'}`}
                                />
                                {item.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-white/90 backdrop-blur text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs tracking-wide">
                                            สินค้าหมด
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                {/* Shine Effect */}
                                <div className="absolute inset-0 skew-x-12 pointer-events-none opacity-0 group-hover:opacity-100 overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine" />
                                </div>

                                {/* Hidden UX: Quick Add Button appears on hover */}
                                {item.stock > 0 && (
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/products/${item.id}`);
                                            }}
                                            className="w-full py-3 bg-white/90 backdrop-blur text-gray-900 font-medium text-sm rounded-xl shadow-lg hover:bg-white hover:text-orange-600 hover:shadow-orange-500/20 transition-all"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                )}
                            </div>
                             <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-900 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                        {item.name}
                                    </h3>
                                    <span className="font-medium text-gray-900">
                                        ฿{item.price}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                   ต่อ {item.unit || 'กก.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </div>
    </div>
  );
}