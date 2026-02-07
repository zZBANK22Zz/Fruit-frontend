import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { fetchAllOrders, updateOrderStatus, uploadDeliveryConfirmation, fetchOrderById } from "../../utils/orderUtils";
import { notifySuccess, notifyError } from "../../utils/notificationUtils";
import DeliveryConfirmationModal from "../../components/DeliveryConfirmationModal";
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  
  // Slip Modal states
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [isSlipLoading, setIsSlipLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const statuses = [
    { value: 'paid', label: 'ชำระเงินแล้ว', color: 'bg-blue-100 text-blue-700' },
    { value: 'received', label: 'รับออเดอร์แล้ว', color: 'bg-purple-100 text-purple-700' },
    { value: 'preparing', label: 'กำลังเตรียมสินค้า', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completed', label: 'เตรียมสินค้าเสร็จแล้ว', color: 'bg-green-100 text-green-700' },
    { value: 'shipped', label: 'จัดส่งแล้ว', color: 'bg-gray-100 text-gray-700' }
  ];

  useEffect(() => {
    checkAdminAccess();
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    if (statusFilter) {
      filtered = filtered.filter(order => (order.order_status || order.status) === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(query) ||
        order.username?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query)
      );
    }
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const checkAdminAccess = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role !== 'admin') {
        router.push('/');
      }
    } else {
      router.push('/registration/LoginPage');
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      notifyError('โหลดข้อมูลล้มเหลว', 'ไม่สามารถโหลดรายชื่อออเดอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // If status is "shipped", show the delivery confirmation modal instead
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrderForDelivery(order);
      setIsDeliveryModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      notifySuccess('อัปเดตสำเร็จ', 'เปลี่ยนสถานะออเดอร์เรียบร้อยแล้ว');
      await loadOrders(); // Refresh list
    } catch (error) {
      notifyError('อัปเดตล้มเหลว', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliveryConfirm = async (deliveryData) => {
    setIsSubmitting(true);
    try {
      await uploadDeliveryConfirmation(selectedOrderForDelivery.id, deliveryData);
      notifySuccess('ส่งสินค้าสำเร็จ', 'บันทึกข้อมูลการจัดส่งเรียบร้อยแล้ว');
      setIsDeliveryModalOpen(false);
      await loadOrders();
    } catch (error) {
      notifyError('เกิดข้อผิดพลาด', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSlip = async (orderId) => {
    setIsSlipModalOpen(true);
    setIsSlipLoading(true);
    try {
      const detail = await fetchOrderById(orderId);
      setSelectedOrderForSlip(detail);
    } catch (error) {
      console.error('Error loading slip details:', error);
      notifyError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดหลักฐานการโอนได้');
    } finally {
      setIsSlipLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedOrderForSlip || downloadLoading) return;

    setDownloadLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!apiUrl || !token) {
        alert('กรุณาเข้าสู่ระบบก่อนดาวน์โหลด');
        return;
      }

      const idToFetch = selectedOrderForSlip.invoice_id || selectedOrderForSlip.id;

      const response = await fetch(`${apiUrl}/api/invoices/${idToFetch}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice-${selectedOrderForSlip.invoice_number || 'download'}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        notifyError('ดาวน์โหลดล้มเหลว', `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      notifyError('เกิดข้อผิดพลาด', error.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  const getStatusLabel = (statusValue) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  const getStatusColor = (statusValue) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.color : 'bg-gray-100 text-gray-700';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">กำลังโหลดข้อมูลออเดอร์...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      <Navbar showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">จัดการออเดอร์</h1>
            <p className="text-gray-600 font-bold">ตรวจสอบและอัปเดตสถานะการจัดส่ง</p>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 self-center md:self-auto transition-all hover:shadow-md">
            <ShoppingBagIcon className="w-6 h-6 text-orange-500" />
            <span className="font-black text-gray-900 text-lg">{orders.length} ออเดอร์ทั้งหมด</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group w-full md:flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all bg-gray-50/50 font-bold text-gray-700 placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-64 bg-gray-50/50 p-1 rounded-2xl border-2 border-gray-50 group focus-within:border-orange-100 transition-colors">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-700 font-black appearance-none cursor-pointer"
              >
                <option value="">ทุกสถานะ</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="pr-4 pointer-events-none">
                <ChevronRightIcon className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
            </div>

            <button 
              onClick={loadOrders}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all font-black text-sm active:scale-95"
              disabled={loading}
            >
              <ClockIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Orders Table (Desktop) / Cards (Mobile) */}
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">ออเดอร์</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">ลูกค้า</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">ยอดรวม</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">วันที่</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                        ไม่พบรายการออเดอร์ที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">#{order.order_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-bold">{order.username || 'N/A'}</span>
                            <span className="text-xs text-gray-500 font-medium">{order.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-orange-600">฿{parseFloat(order.total_amount).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {new Date(order.created_at).toLocaleDateString('th-TH', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.order_status || order.status)}`}>
                            {getStatusLabel(order.order_status || order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.order_status || order.status || 'paid'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={isSubmitting}
                              className="text-sm font-bold border-2 border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 bg-white shadow-sm transition-all"
                            >
                              <option value="paid">ชำระเงินแล้ว</option>
                              <option value="received">รับออเดอร์แล้ว</option>
                              <option value="preparing">กำลังเตรียมสินค้า</option>
                              <option value="completed">เตรียมสินค้าเสร็จแล้ว</option>
                              <option value="shipped">จัดส่งแล้ว</option>
                            </select>
                            <button
                              onClick={() => handleViewSlip(order.id)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                              title="ดูหลักฐานการโอน"
                            >
                              <PhotoIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
                ไม่พบรายการออเดอร์
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md mb-1 inline-block uppercase">ORDER #{order.order_number}</span>
                      <h3 className="text-lg font-black text-gray-900">{order.username || 'N/A'}</h3>
                      <p className="text-sm text-gray-500 font-bold">{order.phone || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">฿{parseFloat(order.total_amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-400 font-bold">
                        {new Date(order.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-sm font-bold text-gray-500">สถานะปัจจุบัน</span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black shadow-sm ${getStatusColor(order.order_status || order.status)}`}>
                        {getStatusLabel(order.order_status || order.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={order.order_status || order.status || 'paid'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isSubmitting}
                        className="w-full text-base font-black border-2 border-orange-100 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 bg-white shadow-sm transition-all appearance-none text-center"
                      >
                        <option value="paid">ชำระเงินแล้ว</option>
                        <option value="received">รับออเดอร์แล้ว</option>
                        <option value="preparing">กำลังเตรียมสินค้า</option>
                        <option value="completed">เตรียมสินค้าเสร็จแล้ว</option>
                        <option value="shipped">จัดส่งแล้ว</option>
                      </select>
                      <button
                        onClick={() => handleViewSlip(order.id)}
                        className="flex-shrink-0 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-bold"
                      >
                        <PhotoIcon className="w-5 h-5" />
                        <span>ดูสลิป</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Info */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50/50 p-5 rounded-3xl border-2 border-blue-100/50 backdrop-blur-sm">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-wider mb-2">รอนำเข้าระบบ</h4>
            <p className="text-3xl font-black text-blue-900">
              {orders.filter(o => (o.order_status || o.status) === 'paid').length}
            </p>
          </div>
          <div className="bg-purple-50/50 p-5 rounded-3xl border-2 border-purple-100/50 backdrop-blur-sm">
            <h4 className="text-purple-700 text-xs font-black uppercase tracking-wider mb-2">กำลังเตรียม</h4>
            <p className="text-3xl font-black text-purple-900">
              {orders.filter(o => (o.order_status || o.status) === 'preparing').length}
            </p>
          </div>
          <div className="bg-green-50/50 p-5 rounded-3xl border-2 border-green-100/50 backdrop-blur-sm">
            <h4 className="text-green-700 text-xs font-black uppercase tracking-wider mb-2">พร้อมส่ง</h4>
            <p className="text-3xl font-black text-green-900">
              {orders.filter(o => (o.order_status || o.status) === 'completed').length}
            </p>
          </div>
          <div className="bg-orange-50/50 p-5 rounded-3xl border-2 border-orange-100/50 backdrop-blur-sm">
            <h4 className="text-orange-700 text-xs font-black uppercase tracking-wider mb-2">ส่งแล้ววันนี้</h4>
            <p className="text-3xl font-black text-orange-900">
              {orders.filter(o => (o.order_status || o.status) === 'shipped').length}
            </p>
          </div>
        </div>
      </div>

      <DeliveryConfirmationModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onConfirm={handleDeliveryConfirm}
        order={selectedOrderForDelivery}
        isSubmitting={isSubmitting}
      />

      {/* Payment Slip Modal for Admin */}
      {isSlipModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-900">หลักฐานการชำระเงิน</h3>
                {selectedOrderForSlip && (
                  <p className="text-sm text-gray-500 font-bold">#{selectedOrderForSlip.order_number}</p>
                )}
              </div>
              <button 
                onClick={() => setIsSlipModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isSlipLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-bold italic">กำลังโหลดหลักฐาน...</p>
                </div>
              ) : selectedOrderForSlip ? (
                <div className="space-y-6">
                  {/* Slip Image */}
                  {selectedOrderForSlip.payment_slip ? (
                    <div className="relative rounded-2xl overflow-hidden border-4 border-gray-50 bg-gray-50 shadow-inner group">
                      <img 
                        src={`data:image/jpeg;base64,${selectedOrderForSlip.payment_slip.image_data}`} 
                        alt="Payment Slip" 
                        className="w-full h-auto object-contain max-h-[500px]"
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={handleDownloadPDF}
                          disabled={downloadLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur shadow-lg border border-gray-200 rounded-xl text-xs font-black text-orange-600 hover:bg-orange-50 transition-all active:scale-95"
                        >
                          <DocumentArrowDownIcon className={`w-4 h-4 ${downloadLoading ? 'animate-bounce' : ''}`} />
                          {downloadLoading ? 'กำลังโหลด...' : 'ดาวโหลดหลักฐานการชำระเงิน'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <PhotoIcon className="w-16 h-16 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold">ยังไม่มีการอัปโหลดหลักฐาน</p>
                    </div>
                  )}

                  {/* Payment Details */}
                  {selectedOrderForSlip.payment_slip && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ยอดเงินในสลิป</p>
                        <p className="text-lg font-black text-gray-900">฿{parseFloat(selectedOrderForSlip.payment_slip.amount || selectedOrderForSlip.total_amount).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">วันที่โอน</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(selectedOrderForSlip.payment_slip.payment_date).toLocaleDateString('th-TH', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Customer Notes */}
                  {selectedOrderForSlip.notes && (
                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">หมายเหตุจากลูกค้า</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedOrderForSlip.notes}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
