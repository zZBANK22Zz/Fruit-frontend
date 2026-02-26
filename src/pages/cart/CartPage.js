import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftIcon,
  TrashIcon,
  HomeIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
  CheckBadgeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import AddressForm from "../../components/AddressForm";

import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart } from "../../utils/cartUtils";
import { notifySuccess } from "../../utils/notificationUtils";
import { handleTokenExpiration, fetchWithAuth } from "../../utils/authUtils";
import { useLanguage } from "../../utils/LanguageContext";

export default function CartPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  // Fetch Delivery Fee when address or cart changes
  useEffect(() => {
    if (selectedAddressId && cartItems.length > 0) {
      calculateDeliveryFee();
    } else {
      setDeliveryFee(0);
    }
  }, [selectedAddressId, cartItems]);

  const calculateDeliveryFee = async () => {
    try {
      setIsCalculatingFee(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      
      if (!apiUrl || !token) return;

      // Prepare items for weight calculation
      const items = cartItems.map(item => ({
        fruit_id: item.id,
        weight: item.quantity, 
        quantity: item.quantity 
      }));

      const response = await fetch(`${apiUrl}/api/delivery/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address_id: selectedAddressId,
          items: items
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDeliveryFee(data.data.delivery_fee);
        }
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setLoading(false);
  };

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // User not logged in, will handle at checkout
      
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const response = await fetchWithAuth(`${apiUrl}/api/addresses`, {}, router.push);
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.data && data.data.addresses) {
          setAddresses(data.data.addresses);
          // Auto-select first address if any
          if (data.data.addresses.length > 0) {
            setSelectedAddressId(data.data.addresses[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };



  const handleAddressSave = async (newAddressData) => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        
        const response = await fetchWithAuth(
            `${apiUrl}/api/addresses`,
            {
                method: 'POST',
                body: JSON.stringify(newAddressData)
            },
            router.push
        );
        
        if (response && response.ok) {
            await loadAddresses(); // Reload list
            setShowAddressForm(false);
            notifySuccess(t('addressSaved'));
        } else {
             alert(t('addressSaveFailed'));
        }
      } catch (error) {
          console.error('Error saving address:', error);
          alert(t('errorOccurred'));
      }
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item.cartKey || item.id);
    loadCart();
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    const key = item.cartKey || item.id;
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }
    // For fruits sold by piece or bunch, ensure quantity is an integer
    if (item.unit === 'piece' || item.unit === 'bunch') {
      newQuantity = Math.floor(newQuantity);
    }
    updateCartItemQuantity(key, newQuantity);
    loadCart();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert(t('cartEmptyAlert'));
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!token) {
        alert(t('loginRequired'));
        router.push('/registration/LoginPage');
        return;
      }

      if (!apiUrl) {
        alert(t('apiNotConfigured'));
        return;
      }

      if (!selectedAddressId) {
        alert(t('selectDeliveryAddress'));
        return;
      }

      // Find selected address details to send as fallback text (optional)
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      const addressString = selectedAddr 
        ? `${selectedAddr.address_line}, ${selectedAddr.sub_district}, ${selectedAddr.district}, ${selectedAddr.province} ${selectedAddr.postal_code}`
        : 'ที่อยู่จัดส่ง';


      // Prepare order items
      const items = cartItems.map(item => ({
        fruit_id: item.id,
        weight: item.quantity, // For fruits sold by kg
        quantity: item.quantity // For fruits sold by piece
      }));

      const response = await fetchWithAuth(
        `${apiUrl}/api/orders`,
        {
          method: 'POST',
          body: JSON.stringify({
            items: items,
            address_id: selectedAddressId, // Send ID for backend fee calculation
            shipping_address: addressString, 
            shipping_city: selectedAddr ? selectedAddr.province : 'Bangkok',
            shipping_postal_code: selectedAddr ? selectedAddr.postal_code : '10110',
            shipping_country: 'Thailand',
            payment_method: 'Thai QR PromptPay',
            notes: null
          }),
        },
        router.push
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.order) {
          const orderId = data.data.order.id;
          const totalAmount = data.data.order.total_amount || getCartTotal();
          
          notifySuccess(
            t('orderSuccess'),
            t('orderCreated', orderId)
          );
          
          clearCart();
          router.push(`/payment/PaymentPage?orderId=${orderId}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || t('orderError'));
      }
    } catch (error) {
      if (!error.message.includes('expired') && !error.message.includes('token')) {
        console.error('Error creating order:', error);
        alert(t('connectionError', error.message));
      }
    }
  };

  const totalAmount = getCartTotal();
  // Using dynamic delivery fee from state instead of static logic
  const SHIPPING_COST = deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 px-4 py-4 border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <h1 className="text-lg font-black text-gray-900">{t('myCart', cartItems.length)}</h1>
          
          <button
            onClick={() => router.push('/')}
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <HomeIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="popLayout">
          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="w-40 h-40 bg-gradient-to-br from-orange-50 to-white border-4 border-white shadow-2xl rounded-full flex items-center justify-center relative z-10">
                  <ShoppingBagIcon className="w-20 h-20 text-orange-200" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg border border-gray-100 z-20 transform rotate-12">
                   <span className="text-2xl">🍊</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{t('cartEmpty')}</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t('cartEmptyDesc')}</p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg shadow-gray-200 hover:bg-black hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>{t('goShopping')}</span>
                <ArrowLeftIcon className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative group overflow-hidden"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div 
                      className="w-24 h-24 rounded-2xl bg-gray-50 flex-shrink-0 cursor-pointer overflow-hidden border border-gray-100"
                      onClick={() => router.push(`/products/${item.id}`)}
                    >
                      <img
                        src={item.image 
                          ? `data:image/jpeg;base64,${item.image}` 
                          : '/images/example.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 
                            className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 cursor-pointer hover:text-orange-600 transition-colors"
                            onClick={() => router.push(`/products/${item.id}`)}
                          >
                            {item.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded-lg">
                          {t('pricePerUnit')}: {item.price} {t('baht')}/{item.selected_label || (item.unit === 'piece' ? t('perPiece') : item.unit === 'bunch' ? t('perBunch') : t('perKg'))}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-50 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => handleUpdateQuantity(item, item.quantity - (item.unit === 'kg' ? 0.5 : 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-orange-600 transition-all active:scale-90 disabled:opacity-50"
                          >
                            <MinusIcon className="w-4 h-4 stroke-[3]" />
                          </button>
                          <div className="min-w-[3rem] text-center font-bold text-sm">
                            {item.unit === 'kg' ? item.quantity.toFixed(1) : item.quantity}{' '}
                            <span className="text-[10px] text-gray-400 font-normal">
                              {item.selected_label || (item.unit === 'piece' ? t('perPiece') : item.unit === 'bunch' ? t('perBunch') : t('perKg'))}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpdateQuantity(item, item.quantity + (item.unit === 'kg' ? 0.5 : 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-green-600 transition-all active:scale-90"
                          >
                            <PlusIcon className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-black text-gray-900">
                            ฿{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Address Selection Section */}
        {cartItems.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-orange-500" />
                        {t('deliveryAddress')}
                    </h3>
                    <button 
                        onClick={() => setShowAddressForm(true)}
                        className="text-sm text-orange-600 font-medium hover:underline flex items-center gap-1"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {t('addNewAddress')}
                    </button>
                </div>
                
                {addresses.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-3">{t('noAddressYet')}</p>
                        <button 
                            onClick={() => setShowAddressForm(true)}
                            className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-orange-500 hover:text-orange-500 transition-colors"
                        >
                            {t('addDeliveryAddress')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map(addr => (
                            <div 
                                key={addr.id}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedAddressId === addr.id 
                                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-gray-900 text-sm">
                                        {addr.address_line}
                                    </p>
                                    {selectedAddressId === addr.id && (
                                        <CheckBadgeIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {addr.sub_district}, {addr.district}, {addr.province} {addr.postal_code}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )}
        
        {/* Address Form Modal */}
        <AddressForm 
            isOpen={showAddressForm}
            onClose={() => setShowAddressForm(false)}
            onSave={handleAddressSave}
        />


        {/* Order Summary Block */}
        {cartItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-orange-500" />
              {t('orderSummary')}
            </h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold">฿{totalAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                  <span>{t('shippingFee')}</span>
                  {SHIPPING_COST === 0 ? (
                    <span className="font-bold text-green-600">{t('freeShipping')}</span>
                  ) : (
                    <span className="font-bold">฿{SHIPPING_COST.toFixed(2)}</span>
                  )}
               </div>
               {totalAmount < 500 && (
                 <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>{t('freeShippingHint', (500 - totalAmount).toFixed(2))}</span>
                 </div>
               )}
               <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-end">
                  <span className="font-bold text-gray-900">{t('totalPayable')}</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    ฿{(totalAmount + SHIPPING_COST).toFixed(2)}
                  </span>
               </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 p-4 pb-8 z-30 shadow-2xl safe-area-bottom">
          <div className="max-w-3xl mx-auto flex gap-4 items-center">
             <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('amountDue')}</p>
                <p className="text-xl font-black text-gray-900">฿{(totalAmount + SHIPPING_COST).toFixed(2)}</p>
             </div>
             <button
                onClick={handleCheckout}
                className="flex-[2] bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
             >
                <span>{t('checkout')}</span>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <ArrowLeftIcon className="w-3 h-3 rotate-180" />
                </div>
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

