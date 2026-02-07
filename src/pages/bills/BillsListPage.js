import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import { fetchUserOrders, fetchOrderById } from "../../utils/orderUtils";
import { 
  XMarkIcon,
  CheckBadgeIcon,
  PhotoIcon,
  TruckIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";

export default function BillsListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const orders = await fetchUserOrders();
      setInvoices(orders);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('เกิดข้อผิดพลาดในการโหลดใบเสร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (orderId) => {
    setIsModalOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await fetchOrderById(orderId);
      setSelectedOrder(detail);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedOrder || downloadLoading) return;

    setDownloadLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!apiUrl || !token) {
        alert('กรุณาเข้าสู่ระบบก่อนดาวน์โหลด');
        return;
      }

      // Use invoice_id from the detailed order data
      const idToFetch = selectedOrder.invoice_id || selectedOrder.id;

      const response = await fetch(`${apiUrl}/api/invoices/${idToFetch}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('ไฟล์ PDF ที่ได้รับมีขนาดเป็น 0');
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice-${selectedOrder.invoice_number || 'download'}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Download failed:', response.status, errorText);
        alert(`ไม่สามารถดาวน์โหลดได้: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด PDF: ' + error.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'ชำระเงินแล้ว';
      case 'received': return 'รับออเดอร์แล้ว';
      case 'preparing': return 'กำลังเตรียมสินค้า';
      case 'completed': return 'เตรียมสินค้าเสร็จแล้ว';
      case 'shipped': return 'จัดส่งแล้ว';
      case 'confirmed': return 'ยืนยันแล้ว';
      default: return status || 'รอดำเนินการ';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'received': return 'bg-purple-100 text-purple-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-gray-100 text-gray-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar showBackButton={true} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ใบเสร็จของฉัน</h1>
          <p className="text-gray-600 text-sm">ประวัติการชำระเงินทั้งหมด</p>
        </div>

        {/* Invoices List */}
        <div className="px-4 sm:px-6 py-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button
                onClick={loadInvoices}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                ลองอีกครั้ง
              </button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ยังไม่มีใบเสร็จ</p>
              <p className="text-gray-400 text-sm mb-6">เมื่อคุณทำการสั่งซื้อและชำระเงิน ใบเสร็จจะแสดงที่นี่</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                ไปช้อปปิ้ง
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => handleOrderClick(invoice.id)}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                      </div>
                      {invoice.order_number && (
                        <p className="text-sm text-gray-600 mb-1">
                          ออเดอร์: {invoice.order_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600 mb-1">
                        {formatCurrency(invoice.total_amount)} บาท
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.order_status || invoice.status)}`}>
                        {getStatusLabel(invoice.order_status || invoice.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(invoice.payment_date || invoice.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>{invoice.payment_method || 'Thai QR PromptPay'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h2>
                {selectedOrder && (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadLoading}
                      className={`flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors ${downloadLoading ? 'opacity-50' : ''}`}
                    >
                      <DocumentArrowDownIcon className={`w-4 h-4 ${downloadLoading ? 'animate-bounce' : ''}`} />
                      {downloadLoading ? 'กำลังโหลด...' : 'ดาวน์โหลด PDF'}
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isDetailLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  {/* Status & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div>
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">สถานะ</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">วันที่ชำระเงิน</p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(selectedOrder.payment_date || selectedOrder.created_at)}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <DocumentTextIcon className="w-4 h-4 text-orange-500" />
                       รายการสินค้า
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          {item.fruit_image && (
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
                              <img 
                                src={`data:image/jpeg;base64,${item.fruit_image}`} 
                                alt={item.fruit_name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.fruit_name}</p>
                            <p className="text-xs text-gray-500">
                              {parseFloat(item.quantity).toFixed(2)} กก. × {parseFloat(item.price).toFixed(2)} บาท
                            </p>
                          </div>
                          <p className="text-sm font-black text-orange-600">
                            {parseFloat(item.subtotal).toFixed(2)} บาท
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Confirmation (Proof of Delivery) */}
                  {selectedOrder.delivery_confirmation && (
                    <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-100 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-200">
                          <TruckIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">หลักฐานการจัดส่งสินค้า</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Delivery Image */}
                        {selectedOrder.delivery_confirmation.delivery_image && (
                          <div className="relative group rounded-2xl overflow-hidden shadow-md border-2 border-white aspect-video md:aspect-square">
                            <img 
                              src={`data:image/jpeg;base64,${selectedOrder.delivery_confirmation.delivery_image}`} 
                              alt="Delivery Proof" 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}
                        
                        {/* Delivery Details */}
                        <div className="space-y-4 flex flex-col justify-center">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">ข้อมูลการจัดส่งสำเร็จ</p>
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                              <span>{formatDate(selectedOrder.delivery_confirmation.delivery_date)}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>เวลา {selectedOrder.delivery_confirmation.delivery_time?.slice(0, 5)} น.</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ชื่อผู้จัดส่ง</p>
                              <p className="text-sm text-gray-900 font-bold">{selectedOrder.delivery_confirmation.sender_name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ชื่อผู้รับ</p>
                              <p className="text-sm text-gray-900 font-bold">{selectedOrder.delivery_confirmation.receiver_name}</p>
                            </div>
                          </div>

                          <div className="space-y-1 pt-2 border-t border-orange-200/50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ที่อยู่รับสินค้า</p>
                            <p className="text-xs text-gray-700 leading-relaxed italic">{selectedOrder.delivery_confirmation.receiver_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Line Divider */}
                  <div className="border-t-2 border-dashed border-gray-100"></div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-orange-500" />
                        สรุปยอดเงิน
                      </h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>ยอดรวม</span>
                          <span>{parseFloat(selectedOrder.total_amount).toFixed(2)} บาท</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-black text-base pt-2 border-t border-gray-200">
                          <span>ยอดรวมทั้งสิ้น</span>
                          <span className="text-orange-600">{parseFloat(selectedOrder.total_amount).toFixed(2)} บาท</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof (Slip) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <PhotoIcon className="w-4 h-4 text-orange-500" />
                        หลักฐานการโอน
                      </h3>
                      {selectedOrder.payment_slip ? (
                        <div className="relative group aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                          <img 
                            src={`data:image/jpeg;base64,${selectedOrder.payment_slip.image_data}`} 
                            alt="Payment Slip" 
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <span className="bg-white/90 text-gray-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">คลิกเพื่อดูรูปขยาย</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                          <PhotoIcon className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400 font-medium">ไม่มีรูปหลักฐานการโอน</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 italic">ไม่พบข้อมูล</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
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

