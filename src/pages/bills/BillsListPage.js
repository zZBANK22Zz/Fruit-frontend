import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "../../utils/LanguageContext";
import liff from "@line/liff";
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import OrangeSpinner from "../../components/OrangeSpinner";
import { fetchUserOrders, fetchOrderById } from "../../utils/orderUtils";
import { 
  XMarkIcon,
  CheckBadgeIcon,
  PhotoIcon,
  TruckIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import ImageModal from "../../components/ImageModal";

export default function BillsListPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Image Zoom State
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomedImageSrc, setZoomedImageSrc] = useState(null);

  const handleImageClick = (src) => {
    setZoomedImageSrc(src);
    setIsImageZoomOpen(true);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const orders = await fetchUserOrders();
      setInvoices(orders);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError(t('errorLoadingInvoices') || 'เกิดข้อผิดพลาดในการโหลดใบเสร็จ');
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
      alert(t('errorLoadingOrderDetails') || 'ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
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
        alert(t('loginToDownload') || 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลด');
        return;
      }

      const idToFetch = selectedOrder.invoice_id || selectedOrder.id;
      const downloadUrl = `${apiUrl}/api/invoices/${idToFetch}/download?token=${encodeURIComponent(token)}&v=${Date.now()}`;
      
      // Detection for LINE or Mobile browser where Blobs often fail
      const isLine = /Line/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.liff?.isInClient?.());
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isLine) {
        // Official way to open PDF in external browser for LIFF
        try {
          if (liff && liff.openWindow) {
            liff.openWindow({
              url: downloadUrl,
              external: true
            });
          } else {
            window.location.href = downloadUrl;
          }
        } catch (e) {
          window.location.href = downloadUrl;
        }
      } else if (isMobile) {
        // Direct link approach for Mobile Browsers
        window.location.href = downloadUrl;
      } else {
        // Standard Blob approach for Desktop (better filename handling)
        const response = await fetch(downloadUrl);

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size === 0) throw new Error(t('pdfSizeZero') || 'ไฟล์ PDF มีขนาดเป็น 0');
          
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
          throw new Error(`Download failed: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert((t('errorDownloadingPdf') || 'เกิดข้อผิดพลาดในการดาวน์โหลด PDF: ') + error.message);
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
      case 'paid': return t('statusPaid') || 'ชำระเงินแล้ว';
      case 'received': return t('statusReceived') || 'รับออเดอร์แล้ว';
      case 'preparing': return t('statusPreparing') || 'กำลังเตรียมสินค้า';
      case 'completed': return t('statusCompleted') || 'เตรียมสินค้าเสร็จแล้ว';
      case 'shipped': return t('statusShipped') || 'จัดส่งแล้ว';
      case 'confirmed': return t('statusConfirmed') || 'ยืนยันแล้ว';
      default: return status ? (t('statusPending') || 'รอดำเนินการ') : (t('statusPending') || 'รอดำเนินการ');
    }
  };

  // Modern Pastel Fruit Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'received': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'preparing': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'completed': return 'bg-green-50 text-green-600 border border-green-100';
      case 'shipped': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar showBackButton={true} />
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-100 rounded-lg mb-8"></div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-50 rounded-[2rem]"></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] font-sans text-gray-900 pb-20 relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      <Navbar showBackButton={true} />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 right-0 -mr-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 sm:mb-10 px-2">
            <div className="p-3 bg-white rounded-2xl shadow-sm shadow-orange-100">
                <DocumentTextIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('myBills') || 'บิลของฉัน'}</h1>
                <p className="text-gray-500 font-medium text-sm">{t('orderHistoryDesc') || 'ประวัติการสั่งซื้อความอร่อยทั้งหมด'}</p>
            </div>
        </div>

        {/* Content */}
        <div>
          {error ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 mx-2">
              <p className="text-red-500 font-bold mb-4">{error}</p>
              <button
                onClick={loadInvoices}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 shadow-lg"
              >
                {t('tryAgain') || 'ลองอีกครั้ง'}
              </button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 mx-2 flex flex-col items-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBagIcon className="w-10 h-10 text-orange-300" />
              </div>
              <p className="text-2xl font-black text-gray-900 mb-2">{t('noInvoicesYet') || 'ยังไม่มีใบเสร็จ'}</p>
              <p className="text-gray-400 font-medium mb-8">{t('startShoppingFreshFruits') || 'เริ่มช้อปผลไม้สดๆ กันเถอะ!'}</p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-1"
              >
                {t('goShopping') || 'ไปช้อปปิ้งเลย'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => handleOrderClick(invoice.id)}
                  className="group bg-white rounded-[2rem] p-6 shadow-sm shadow-gray-100 hover:shadow-xl hover:shadow-orange-100/50 border border-gray-100 hover:border-orange-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">🧾</span>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {invoice.invoice_number}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold tracking-wide uppercase">
                                    ORDER #{invoice.order_number}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-gray-500">
                             <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{formatDate(invoice.payment_date || invoice.created_at)}</span>
                             </div>
                             <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span>{invoice.payment_method || 'QR PromptPay'}</span>
                             </div>
                        </div>
                    </div>

                    {/* Right: Status & Amount */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(invoice.order_status || invoice.status)}`}>
                            {getStatusLabel(invoice.order_status || invoice.status)}
                        </span>
                        <p className="text-2xl font-black text-gray-900">
                            {formatCurrency(invoice.total_amount)} <span className="text-sm text-gray-400 font-medium">THB</span>
                        </p>
                    </div>

                  </div>
                  
                  {/* Decorative Arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-orange-400 hidden sm:block">
                      <ArrowLeftIcon className="w-6 h-6 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('receiptTitle') || 'ใบเสร็จรับเงิน'}</h2>
                <p className="text-sm text-gray-500 font-medium">{t('transactionDetails') || 'รายละเอียดธุรกรรมของคุณ'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAFAFA]">
              {isDetailLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <OrangeSpinner className="w-12 h-12 mb-4" />
                  <p className="text-gray-400 font-medium animate-pulse">{t('unpackingData') || 'กำลังแกะกล่องข้อมูล...'}</p>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-8 max-w-xl mx-auto">
                  
                  {/* Status Card */}
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(selectedOrder.status).replace('text-', 'bg-').split(' ')[0]} ${getStatusColor(selectedOrder.status).includes('blue') ? 'text-blue-500' : 'text-white'}`}>
                            <CheckBadgeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('orderStatusTitle') || 'สถานะการสั่งซื้อ'}</p>
                            <p className="text-lg font-black text-gray-900">{getStatusLabel(selectedOrder.status)}</p>
                        </div>
                     </div>
                     {selectedOrder && (
                        <button
                          onClick={handleDownloadPDF}
                          disabled={downloadLoading}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${downloadLoading ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800 hover:-translate-y-1 shadow-lg'}`}
                        >
                          <DocumentArrowDownIcon className={`w-4 h-4 ${downloadLoading ? 'animate-bounce' : ''}`} />
                          {downloadLoading ? (t('loading') || 'กำลังโหลด...') : (t('downloadPdf') || 'ดาวน์โหลด PDF')}
                        </button>
                     )}
                  </div>

                  {/* Items List */}
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 pl-2">{t('productListTitle') || 'รายการสินค้า'}</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
                          {item.fruit_image ? (
                            <img 
                                src={`data:image/jpeg;base64,${item.fruit_image}`} 
                                alt={item.fruit_name} 
                                className="w-14 h-14 object-cover rounded-xl bg-gray-50"
                              />
                          ) : (
                              <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">🍎</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-900 truncate">{item.fruit_name}</p>
                            <p className="text-sm text-gray-500 font-medium">
                              {parseFloat(item.quantity).toFixed(1)} กก. × {parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-base font-black text-gray-900">
                            {parseFloat(item.subtotal).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {selectedOrder.delivery_confirmation && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-[2rem] p-6 border border-orange-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <TruckIcon className="w-5 h-5 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">{t('deliveryInfoTitle') || 'ข้อมูลการจัดส่ง'}</h3>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {selectedOrder.delivery_confirmation.delivery_image && (
                              <div className="rounded-2xl overflow-hidden border-4 border-white shadow-sm rotate-1 hover:rotate-0 transition-transform duration-500">
                                <img 
                                  src={`data:image/jpeg;base64,${selectedOrder.delivery_confirmation.delivery_image}`} 
                                  alt="Proof" 
                                  className="w-full h-full object-cover aspect-square cursor-zoom-in hover:brightness-95 transition-all"
                                  onClick={() => handleImageClick(`data:image/jpeg;base64,${selectedOrder.delivery_confirmation.delivery_image}`)}
                                />
                              </div>
                            )}
                            <div className="space-y-4 flex flex-col justify-center">
                                <div>
                                    <p className="text-xs font-bold text-orange-400 uppercase">{t('shippedOn') || 'จัดส่งเมื่อ'}</p>
                                    <p className="text-gray-900 font-bold">{formatDate(selectedOrder.delivery_confirmation.delivery_date)} เวลา {selectedOrder.delivery_confirmation.delivery_time?.slice(0, 5)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-orange-400 uppercase">{t('receiver') || 'ผู้รับ'}</p>
                                    <p className="text-gray-900 font-bold">{selectedOrder.delivery_confirmation.receiver_name}</p>
                                </div>
                                <div className="pt-2 border-t border-orange-200">
                                    <p className="text-xs text-gray-600 leading-relaxed max-h-20 overflow-y-auto">{selectedOrder.delivery_confirmation.receiver_address}</p>
                                </div>
                            </div>
                         </div>
                    </div>
                  )}

                  {/* Summary & Slip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">{t('summaryTitle') || 'สรุปยอด'}</h3>
                        <div className="space-y-3">
                             <div className="flex justify-between text-gray-500 font-medium">
                                <span>{t('subtotal') || 'ยอดรวม'}</span>
                                <span>{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-50">
                                <span>{t('grandTotal') || 'รวมทั้งสิ้น'}</span>
                                <span className="text-orange-500">{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                             </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">{t('transferSlipTitle') || 'หลักฐานโอนเงิน'}</h3>
                        {selectedOrder.payment_slip ? (
                            <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                                <img 
                                    src={`data:image/jpeg;base64,${selectedOrder.payment_slip.image_data}`} 
                                    alt="Slip" 
                                    className="w-full h-40 object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500"
                                    onClick={() => handleImageClick(`data:image/jpeg;base64,${selectedOrder.payment_slip.image_data}`)}
                                />
                            </div>
                        ) : (
                            <div className="h-40 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                <PhotoIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs font-bold">{t('noSlip') || 'ไม่มีสลิป'}</span>
                            </div>
                        )}
                     </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">{t('noDataFound') || 'ไม่พบข้อมูล'}</div>
              )}
            </div>

          </div>
        </div>
      )}

      <ImageModal 
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        imageSrc={zoomedImageSrc}
        alt="Proof Zoom"
      />
    </div>
  );
}
