import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeftIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart } from "../../utils/cartUtils";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setLoading(false);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    loadCart();
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
    loadCart();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('กรุณาเพิ่มสินค้าลงตะกร้าก่อน');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
        router.push('/registration/LoginPage');
        return;
      }

      if (!apiUrl) {
        alert('API configuration missing');
        return;
      }

      // Prepare order items
      const items = cartItems.map(item => ({
        fruit_id: item.id,
        quantity: item.quantity
      }));

      // Create order
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items,
          shipping_address: 'ที่อยู่จัดส่ง', // TODO: Get from user profile or form
          shipping_city: 'Bangkok',
          shipping_postal_code: '10110',
          shipping_country: 'Thailand',
          payment_method: 'Thai QR PromptPay',
          notes: null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.order) {
          const orderId = data.data.order.id;
          // Clear cart after successful order creation
          clearCart();
          // Redirect to payment page with order ID
          router.push(`/payment/PaymentPage?orderId=${orderId}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'เกิดข้อผิดพลาดในการสร้างออเดอร์');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const totalAmount = getCartTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg font-semibold text-black">ตะกร้าสินค้า</h1>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Cart Items Section */}
      <div className="flex-1 overflow-y-auto pb-24">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">ตะกร้าของคุณว่างเปล่า</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mt-4"
            >
              ไปช้อปปิ้ง
            </button>
          </div>
        ) : (
          <div className="px-4 py-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.image_url || '/images/example.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/example.jpg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-black mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-orange-500 mb-3">
                      {item.price} บาท
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600 font-semibold">−</span>
                      </button>
                      
                      <span className="text-base font-medium text-black min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.stock && item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-gray-600 font-semibold">+</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-sm text-gray-600 mt-2">
                      รวม: {(item.price * item.quantity).toFixed(2)} บาท
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      {cartItems.length > 0 && (
        <div className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-black">ยอดรวมทั้งหมด</span>
              <span className="text-2xl font-bold text-orange-500">
                {totalAmount.toFixed(2)} บาท
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

