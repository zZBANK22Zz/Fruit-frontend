import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ShoppingCartIcon, CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { addToCart, updateCartItemQuantity } from "../../utils/cartUtils";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";

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
          console.error('API URL is not configured');
          setError('API URL is not configured');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/fruits/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.fruit) {
            setProduct(data.data.fruit);
          } else {
            setError('Product not found');
          }
        } else if (response.status === 404) {
          setError('Product not found');
        } else {
          console.error('Failed to fetch product:', response.status);
          setError('Failed to load product');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Calculate total price based on unit (weight for kg, quantity for piece)
  useEffect(() => {
    const calculatePrice = async () => {
      if (!product) return;

      // If sold by piece, calculate directly
      if (product.unit === 'piece') {
        setTotalPrice(product.price * quantity);
        return;
      }

      // If sold by weight (kg), use backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      if (!apiUrl) {
        console.error("API URL is not configured for price calculation");
        setTotalPrice(product.price * weight);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/fruits/calculate-total-price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fruit_id: product.id,
            weight, // weight in kilograms (can be decimal)
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && typeof data.data.totalPrice === "number") {
            setTotalPrice(data.data.totalPrice);
          } else {
            // Fallback to frontend calculation if response is not as expected
            setTotalPrice(product.price * weight);
          }
        } else {
          console.error("Failed to calculate total price:", response.status);
          setTotalPrice(product.price * weight);
        }
      } catch (err) {
        console.error("Error calculating total price:", err);
        setTotalPrice(product.price * weight);
      }
    };

    calculatePrice();
  }, [product, weight, quantity]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleWeightChange = (newWeight) => {
    // Ensure positive weight; allow decimals
    if (newWeight <= 0) return;
    setWeight(newWeight);
  };

  const handleQuantityChange = (newQuantity) => {
    // Ensure positive integer quantity
    if (newQuantity < 1 || !Number.isInteger(newQuantity)) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product) {
      // Add product to cart with selected weight or quantity based on unit
      const amount = product.unit === 'piece' ? quantity : weight;
      addToCart(product, amount);
      const unitLabel = product.unit === 'piece' ? 'ลูก' : 'กิโลกรัม';
      showToastMessage(`${product.name} ${amount} ${unitLabel} ถูกเพิ่มลงตะกร้าแล้ว`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Add product to cart with selected weight or quantity based on unit
      const amount = product.unit === 'piece' ? quantity : weight;
      addToCart(product, amount);
      // Navigate to cart page
      router.push('/cart/CartPage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">กำลังโหลด...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-red-500 text-lg mb-4">{error || 'Product not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          กลับ
        </button>
      </div>
    );
  }

  const maxQuantity = product.stock || 999;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar showBackButton={true} />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-400">
            <CheckCircleIcon className="w-6 h-6" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Content Section - Flex grow to push bottom bar down */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Product Image Section */}
        <div className="w-full bg-gradient-to-b from-white via-orange-50/20 to-transparent flex items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
              <img
                src={product.image 
                  ? `data:image/jpeg;base64,${product.image}` 
                  : '/images/example.jpg'}
                alt={product.name}
                className="w-full h-auto object-contain rounded-2xl"
                onError={(e) => {
                  console.error('Image failed to load');
                  e.target.src = '/images/example.jpg';
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="bg-white px-4 sm:px-6 py-6 rounded-t-3xl shadow-lg">
          {/* Stock Badge */}
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-full text-sm font-semibold mb-4 border border-red-200 shadow-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              สินค้าหมด
            </div>
          ) : product.stock && product.stock < 10 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-sm font-semibold mb-4 border border-orange-200 shadow-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              เหลือเพียง {product.unit === 'piece' ? parseInt(product.stock || 0) : parseFloat(product.stock || 0).toFixed(2)} {product.unit === 'piece' ? 'ลูก' : 'กิโลกรัม'}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full text-sm font-semibold mb-4 border border-green-200 shadow-sm">
              <CheckCircleIcon className="w-4 h-4" />
              มีสินค้า
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-baseline gap-3 mb-6">
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {product.price}
            </p>
            <span className="text-xl text-gray-600 font-medium">บาท {product.unit === 'piece' ? 'ต่อลูก' : 'ต่อกิโลกรัม'}</span>
            {product.stock && (
              <p className="text-sm text-gray-500">
                / สินค้าคงเหลือ {product.unit === 'piece' ? parseInt(product.stock || 0) : parseFloat(product.stock || 0).toFixed(2)} {product.unit === 'piece' ? 'ลูก' : 'กิโลกรัม'}
              </p>
            )}
          </div>

          {/* Quantity/Weight Selector */}
          {!isOutOfStock && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {product.unit === 'piece' ? 'จำนวนลูก' : 'จำนวนกิโลกรัม'}
              </label>
              <div className="flex items-center gap-4">
                {product.unit === 'piece' ? (
                  // Quantity selector for fruits sold by piece
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-orange-600 transform hover:scale-110 active:scale-95"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        handleQuantityChange(Number.isNaN(value) ? 1 : value);
                      }}
                      className="w-16 h-10 text-center border-0 bg-transparent focus:outline-none font-bold text-lg text-gray-900"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-orange-600 transform hover:scale-110 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  // Weight selector for fruits sold by kg
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
                    <button
                      onClick={() => handleWeightChange(parseFloat((weight - 0.5).toFixed(1)))}
                      disabled={weight <= 0.5}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-orange-600 transform hover:scale-110 active:scale-95"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={maxQuantity}
                      value={weight}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        handleWeightChange(Number.isNaN(value) ? 0.1 : value);
                      }}
                      className="w-16 h-10 text-center border-0 bg-transparent focus:outline-none font-bold text-lg text-gray-900"
                    />
                    <button
                      onClick={() => handleWeightChange(parseFloat((weight + 0.5).toFixed(1)))}
                      disabled={weight >= maxQuantity}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-orange-600 transform hover:scale-110 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                )}
                <div className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <span className="text-xs text-gray-600 block">รวม</span>
                  <span className="font-extrabold text-xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    {((totalPrice ?? (product.unit === 'piece' ? product.price * quantity : product.price * weight))).toFixed(2)} บาท
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-gradient-to-r from-transparent via-gray-200 to-transparent my-8"></div>

          {/* Details Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
              รายละเอียดสินค้า
            </h2>
            <div className="space-y-3">
              {product.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {product.description}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/6 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Farm Direct Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full border border-green-200">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">ส่งตรงจากสวน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl z-40 safe-area-bottom">
        <div className="flex gap-3 p-4">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            <ShoppingCartIcon className="w-7 h-7 text-gray-700 mb-1.5" />
            <span className="text-xs text-gray-700 font-bold">กดใส่ตะกร้า</span>
          </button>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-[2] flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 active:from-orange-700 active:via-orange-700 active:to-orange-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-white font-bold">ซื้อเลย</span>
              <ArrowRightIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white leading-tight">
              {((totalPrice ?? product.price * weight)).toFixed(2)} บาท
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

