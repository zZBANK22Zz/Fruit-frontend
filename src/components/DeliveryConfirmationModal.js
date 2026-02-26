import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import OrangeSpinner from './OrangeSpinner';

export default function DeliveryConfirmationModal({ isOpen, onClose, onConfirm, onDispatchQR, order, isSubmitting }) {
  const [formData, setFormData] = useState({
    delivery_image: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time: new Date().toTimeString().slice(0, 5),
    sender_name: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: ''
  });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Re-populate receiver info whenever the order prop changes
  useEffect(() => {
    if (!order) return;

    const receiverName = (order.first_name || order.last_name)
      ? `${order.first_name || ''} ${order.last_name || ''}`.trim()
      : (order.username || '');

    const receiverAddress = order.address_line
      ? [order.address_line, order.sub_district, order.district, order.province, order.postal_code]
          .filter(Boolean).join(', ')
      : (order.shipping_address || '');

    setFormData(prev => ({
      ...prev,
      receiver_name: receiverName,
      receiver_phone: order.phone_number || order.phone || '',
      receiver_address: receiverAddress
    }));
  }, [order]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit for Vercel (base64 will be ~4MB)
        alert('รูปภาพมีขนาดใหญ่เกินไป (จำกัด 3MB เพื่อความเสถียร)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, delivery_image: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.delivery_image) {
      alert('กรุณาอัปโหลดรูปภาพยืนยันการส่ง');
      return;
    }
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900">ยืนยันการจัดส่ง</h2>
            <p className="text-gray-500 font-bold">ออเดอร์ #{order?.order_number}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Photo Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">รูประบุการส่ง</label>
              <div 
                className={`relative aspect-square rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                  ${preview ? 'border-orange-500 bg-gray-50' : 'border-gray-200 bg-gray-50'}`}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Delivery preview" className="w-full h-full object-cover" />
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <CameraIcon className="w-12 h-12 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase">ไม่มีรูปภาพตัวอย่าง</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 text-orange-600 border-2 border-orange-100 hover:bg-orange-100 transition-all font-black"
                >
                  <CameraIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs">ถ่ายรูป/กล้อง</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-100 transition-all font-black"
                >
                  <PhotoIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs">เลือกจากคลัง</span>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <input 
                type="file" 
                ref={cameraInputRef}
                onChange={handleImageChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>

            {/* Right Side: Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest px-1">ข้อมูลผู้จัดส่ง</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">วันที่</label>
                    <input
                      type="date"
                      required
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white font-bold transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">เวลา</label>
                    <input
                      type="time"
                      required
                      value={formData.delivery_time}
                      onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white font-bold transition-all text-sm"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="ชื่อผู้จัดส่ง"
                  required
                  value={formData.sender_name}
                  onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white font-bold transition-all text-sm"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">ข้อมูลผู้รับ</h3>
                  {/* <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">จากโปรไฟล์ลูกค้า</span> */}
                </div>
                <div className="bg-blue-50/60 border-2 border-blue-100 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">ชื่อผู้รับ</p>
                    <p className="font-bold text-gray-900 text-sm">{formData.receiver_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">เบอร์โทรศัพท์</p>
                    <p className="font-bold text-gray-900 text-sm">{formData.receiver_phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">ที่อยู่จัดส่ง</p>
                    <p className="font-bold text-gray-900 text-sm leading-relaxed">{formData.receiver_address || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black hover:bg-gray-200 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] px-6 py-4 rounded-2xl bg-orange-500 text-white font-black shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <OrangeSpinner className="w-5 h-5" />
                    <span>กำลังบันทึก...</span>
                  </div>
                ) : (
                  'ยืนยันจัดส่งสินค้า'
                )}
              </button>
            </div>
            
            {onDispatchQR && (
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">หรือ</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            )}
            
            {onDispatchQR && (
              <button
                type="button"
                onClick={() => onDispatchQR(order.id)}
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-2xl bg-indigo-50 text-indigo-600 font-black border-2 border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
                ส่งด้วย Rider (สแกน QR)
              </button>
            )}
          </div>
        </form>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}
