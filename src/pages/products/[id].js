import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCartIcon, 
  CheckCircleIcon, 
  ArrowRightIcon, 
  MinusIcon, 
  PlusIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { addToCart } from "../../utils/cartUtils";
import Navbar from "../../components/Navbar";
import OrangeSpinner from "../../components/OrangeSpinner";

export default function SelectedPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weight, setWeight] = useState(1.0); // kilograms (can be decimal)
  const [quantity, setQuantity] = useState(1); // quantity for fruits sold by piece
  const [totalPrice, setTotalPrice] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  // Fetch product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        if (!apiUrl) {
          setError('ไม่พบ URL ของ API');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/fruits/${id}`);

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.fruit) {
            setProduct(data.data.fruit);
          } else {
            setError('Product not found');
          }
        } else {
          setError('โหลดข้อมูลสินค้าไม่สำเร็จ');
        }
      } catch (error) {
        setError('เกิดข้อผิดพลาดในการโหลดสินค้า');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Calculate total price
  useEffect(() => {
    const calculatePrice = async () => {
      if (!product) return;

      if (product.unit === 'piece') {
        setTotalPrice(product.price * quantity);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      if (!apiUrl) {
        setTotalPrice(product.price * weight);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/fruits/calculate-total-price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fruit_id: product.id,
            weight, 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && typeof data.data.totalPrice === "number") {
            setTotalPrice(data.data.totalPrice);
          } else {
            setTotalPrice(product.price * weight);
          }
        } else {
          setTotalPrice(product.price * weight);
        }
      } catch (err) {
        setTotalPrice(product.price * weight);
      }
    };

    calculatePrice();
  }, [product, weight, quantity]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWeightChange = (newWeight) => {
    if (newWeight <= 0) return;
    setWeight(newWeight);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || !Number.isInteger(newQuantity)) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product) {
      const amount = product.unit === 'piece' ? quantity : weight;
      addToCart(product, amount);
      const unitLabel = product.unit === 'piece' ? 'ลูก' : 'กก.';
      showToastMessage(`เพิ่ม ${product.name} ${amount} ${unitLabel} ลงตะกร้าแล้ว`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const amount = product.unit === 'piece' ? quantity : weight;
      addToCart(product, amount);
      router.push('/cart/CartPage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <OrangeSpinner className="w-16 h-16 mx-auto mb-4" />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 font-medium"
            >
              กำลังคัดเลือกผลไม้สดๆ...
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-red-500 text-lg mb-4 font-bold">{error || 'ไม่พบสินค้า'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all font-bold shadow-lg shadow-orange-200"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const maxQuantity = product.stock || 999;
  const isOutOfStock = product.stock === 0;
  const currentTotal = totalPrice ?? (product.unit === 'piece' ? product.price * quantity : product.price * weight);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 pb-32">
      <Navbar showBackButton={true} />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60]"
          >
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-green-100 ring-4 ring-green-50">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          
          {/* Image Gallery / Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square w-full rounded-[2.5rem] bg-gradient-to-br from-orange-50 to-white border border-white shadow-xl shadow-orange-100/50 overflow-hidden relative group">
              <motion.img
                src={product.image ? `data:image/jpeg;base64,${product.image}` : '/images/example.jpg'}
                alt={product.name}
                className="w-full h-full object-contain p-8 sm:p-12 drop-shadow-2xl z-10 relative"
                initial={{ scale: 0.9, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.2
                }}
                whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
              />
              
              {/* Background Decorative Blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200/20 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />
              
              {/* Floating Badge */}
              {product.farmDirect && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2 z-20"
                >
                  <SparklesIcon className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-gray-700">ส่งตรงจากสวน</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 px-2 sm:px-0 lg:mt-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <span>รหัสสินค้า: {String(product.id || '').split('-')[0]}</span>
                  {product.stock && (
                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isOutOfStock ? 'สินค้าหมด' : 'มีสินค้า'}
                     </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-90"
              >
                {isLiked ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
                )}
              </button>
            </div>

            <div className="mt-8">
              <h3 className="sr-only">Product price</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ฿{product.price}
                </span>
                <span className="text-xl text-gray-400 font-medium">/ {product.unit === 'piece' ? 'ลูก' : 'กก.'}</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">รายละเอียด</h3>
              <div className="prose prose-sm text-gray-600 leading-relaxed bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p>{product.description || "ผลไม้สดเกรดพรีเมียม คัดพิเศษจากสวนที่ดีที่สุด เพื่อรสชาติที่ยอดเยี่ยมและคุณประโยชน์ครบถ้วน เหมาะสำหรับทุกคนในครอบครัว"}</p>
              </div>
            </div>

            {/* Controls */}
            {!isOutOfStock && (
              <div className="mt-10 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-900">
                    {product.unit === 'piece' ? 'จำนวนต้องการ (ลูก)' : 'น้ำหนักที่ต้องการ (กก.)'}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                     มีสินค้า {product.unit === 'piece' ? parseInt(product.stock) : parseFloat(product.stock).toFixed(2)} {product.unit === 'piece' ? 'ลูก' : 'กก.'}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                   {/* Quantity/Weight Selector */}
                   <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 w-fit">
                      <button
                        onClick={() => product.unit === 'piece' ? handleQuantityChange(quantity - 1) : handleWeightChange(parseFloat((weight - 0.5).toFixed(1)))}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-600 hover:shadow transition-all disabled:opacity-50 disabled:shadow-none"
                        disabled={product.unit === 'piece' ? quantity <= 1 : weight <= 0.5}
                      >
                        <MinusIcon className="w-5 h-5" />
                      </button>
                      
                      <div className="w-20 text-center">
                        <span className="text-xl font-black text-gray-900">
                           {product.unit === 'piece' ? quantity : weight}
                        </span>
                      </div>

                      <button
                        onClick={() => product.unit === 'piece' ? handleQuantityChange(quantity + 1) : handleWeightChange(parseFloat((weight + 0.5).toFixed(1)))}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-600 hover:shadow transition-all disabled:opacity-50 disabled:shadow-none"
                        disabled={product.unit === 'piece' ? quantity >= maxQuantity : weight >= maxQuantity}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                   </div>

                   {/* Total Display */}
                   <div className="flex-1 bg-orange-50 rounded-2xl px-6 py-3 border border-orange-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">ราคารวม</span>
                      <span className="text-2xl font-black text-orange-600">฿{currentTotal.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Floating Action Bar (Glassmorphism) */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
         {/* Gradient Fade */}
         <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-4 relative">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-3 flex gap-3">
               <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-4 px-6 rounded-[1.5rem] bg-orange-50 text-orange-600 font-bold text-lg hover:bg-orange-100 transition-all border border-orange-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
               >
                  <ShoppingCartIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">ใส่ตะกร้า</span>
               </button>

               <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-[2] py-4 px-6 rounded-[1.5rem] font-black text-lg text-white shadow-xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 relative overflow-hidden group ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}
               >
                  {isOutOfStock ? (
                      <span>สินค้าหมดชั่วคราว</span>
                  ) : (
                      <>
                        <span>ซื้อเลย</span>
                        <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        {/* Shine Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      </>
                  )}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}


