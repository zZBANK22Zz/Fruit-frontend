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
  const [quantity, setQuantity] = useState(1);
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

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (product.stock && newQuantity > product.stock) {
      showToastMessage(`มีสินค้าเพียง ${product.stock} ชิ้น`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product) {
      // Add multiple quantities
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      showToastMessage(`${product.name} ${quantity} ชิ้น ถูกเพิ่มลงตะกร้าแล้ว`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Add multiple quantities
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar showBackButton={true} />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Content Section - Flex grow to push bottom bar down */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Product Image Section */}
        <div className="w-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <img
                src={product.image_url || '/images/example.jpg'}
                alt={product.name}
                className="w-full h-auto object-contain rounded-xl"
                onError={(e) => {
                  console.error('Image failed to load:', product.image_url);
                  e.target.src = '/images/example.jpg';
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="bg-white px-4 sm:px-6 py-6">
          {/* Stock Badge */}
          {isOutOfStock ? (
            <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-3">
              สินค้าหมด
            </div>
          ) : product.stock && product.stock < 10 ? (
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-3">
              เหลือเพียง {product.stock} ชิ้น
            </div>
          ) : (
            <div className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-3">
              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
              มีสินค้า
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>
          
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-3xl sm:text-4xl font-bold text-orange-500">
              {product.price} บาท
            </p>
            {product.stock && (
              <p className="text-sm text-gray-500">
                / สินค้าคงเหลือ {product.stock} ชิ้น
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวน
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-600"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 font-semibold text-lg"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-600"
                >
                  +
                </button>
                <div className="ml-auto text-sm text-gray-600">
                  รวม: <span className="font-bold text-orange-500 text-lg">
                    {(product.price * quantity).toFixed(2)} บาท
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Details Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              รายละเอียดสินค้า
            </h2>
            <div className="space-y-3">
              {product.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
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
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>ส่งตรงจากสวน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 safe-area-bottom">
        <div className="flex gap-2 p-3">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 disabled:hover:bg-gray-50"
          >
            <ShoppingCartIcon className="w-6 h-6 text-gray-700 mb-1.5" />
            <span className="text-xs text-gray-700 font-semibold">กดใส่ตะกร้า</span>
          </button>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 active:from-orange-700 active:via-orange-700 active:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-white font-semibold">ซื้อเลย</span>
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white leading-tight">
              {(product.price * quantity).toFixed(2)} บาท
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

