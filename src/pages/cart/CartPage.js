import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeftIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart } from "../../utils/cartUtils";
import { notifySuccess } from "../../utils/notificationUtils";

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
          const totalAmount = data.data.order.total_amount || getCartTotal();
          
          // Add success notification
          notifySuccess(
            'สั่งซื้อสำเร็จ',
            `ออเดอร์ของคุณ #${orderId} ถูกสร้างเรียบร้อยแล้ว กรุณาชำระเงิน ${parseFloat(totalAmount).toFixed(2)} บาท`
          );
          
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-orange-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
          ตะกร้าสินค้า
        </h1>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Cart Items Section */}
      <div className="flex-1 overflow-y-auto pb-32">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-16">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-16 h-16 text-orange-400"
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
            <p className="text-gray-600 text-xl font-bold mb-2">ตะกร้าของคุณว่างเปล่า</p>
            <p className="text-gray-500 text-sm mb-6">เริ่มเพิ่มสินค้าลงตะกร้ากันเลย!</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              ไปช้อปปิ้ง
            </button>
          </div>
        ) : (
          <div className="px-4 py-6">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                    <img
                      src={item.image 
                        ? `data:image/jpeg;base64,${item.image}` 
                        : '/images/example.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/example.jpg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <p className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                        {item.price}
                      </p>
                      <span className="text-sm text-gray-500">บาท</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                        >
                          <span className="text-gray-700 font-bold">−</span>
                        </button>
                        
                        <span className="text-base font-bold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock && item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="text-gray-700 font-bold">+</span>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        รวม: <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          {(item.price * item.quantity).toFixed(2)} บาท
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl z-40">
          <div className="px-4 py-5">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-lg font-bold text-gray-700">ยอดรวมทั้งหมด</span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {totalAmount.toFixed(2)} บาท
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

