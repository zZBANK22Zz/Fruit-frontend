import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CreditCardIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";

export default function BillPage() {
  const router = useRouter();
  const { orderId, invoiceId } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!orderId && !invoiceId) {
        setError('ไม่พบข้อมูลใบเสร็จ');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        const token = localStorage.getItem('token');

        if (!apiUrl || !token) {
          setError('กรุณาเข้าสู่ระบบก่อน');
          setLoading(false);
          return;
        }

        let response;
        if (invoiceId) {
          // Get invoice by invoice ID
          response = await fetch(`${apiUrl}/api/invoices/${invoiceId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else if (orderId) {
          // Get invoice by order ID
          response = await fetch(`${apiUrl}/api/invoices/order/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data.data && data.data.invoice) {
            setInvoice(data.data.invoice);
          } else {
            setError('ไม่พบข้อมูลใบเสร็จ');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || 'ไม่สามารถโหลดใบเสร็จได้');
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        setError('เกิดข้อผิดพลาดในการโหลดใบเสร็จ');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [orderId, invoiceId]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!apiUrl || !token) return;

      const response = await fetch(`${apiUrl}/api/invoices/${invoice.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('ไม่สามารถดาวน์โหลด PDF ได้');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">กำลังโหลดใบเสร็จ...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error || 'ไม่พบข้อมูลใบเสร็จ'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              กลับหน้าหลัก
            </button>
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
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8 px-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">ชำระเงินสำเร็จ!</h1>
          <p className="text-green-100">ขอบคุณที่ชำระเงิน ใบเสร็จของคุณพร้อมแล้ว</p>
        </div>

        {/* Invoice Card */}
        <div className="px-4 sm:px-6 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">ใบเสร็จรับเงิน</h2>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">ดาวน์โหลด PDF</span>
                </button>
              </div>
              <p className="text-sm text-gray-600">เลขที่: <span className="font-semibold">{invoice.invoice_number}</span></p>
            </div>

            {/* Invoice Details */}
            <div className="p-6 space-y-6">
              {/* Order & Payment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700">วันที่ชำระเงิน</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(invoice.payment_date)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700">วิธีชำระเงิน</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{invoice.payment_method || 'Thai QR PromptPay'}</p>
                </div>
              </div>

              {/* Order Number */}
              {invoice.order_number && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">เลขที่ออเดอร์</p>
                  <p className="text-lg font-bold text-blue-700">{invoice.order_number}</p>
                </div>
              )}

              {/* Shipping Address */}
              {invoice.shipping_address && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TruckIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700">ที่อยู่จัดส่ง</h3>
                  </div>
                  <p className="text-gray-900">
                    {invoice.shipping_address}
                    {invoice.shipping_city && `, ${invoice.shipping_city}`}
                    {invoice.shipping_postal_code && ` ${invoice.shipping_postal_code}`}
                    {invoice.shipping_country && `, ${invoice.shipping_country}`}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">รายการสินค้า</h3>
                <div className="space-y-3">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {item.fruit_image && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={item.fruit_image}
                              alt={item.fruit_name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/images/example.jpg';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.fruit_name || 'สินค้า'}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              จำนวน {item.quantity} ชิ้น × {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)} บาท
                            </p>
                            <p className="font-bold text-orange-600">
                              {typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : parseFloat(item.subtotal || 0).toFixed(2)} บาท
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">ไม่มีรายการสินค้า</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200"></div>

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ยอดรวม</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {(typeof invoice.subtotal === 'number' ? invoice.subtotal : parseFloat(invoice.subtotal || 0)).toFixed(2) || (typeof invoice.total_amount === 'number' ? invoice.total_amount : parseFloat(invoice.total_amount || 0)).toFixed(2)} บาท
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {(typeof invoice.total_amount === 'number' ? invoice.total_amount : parseFloat(invoice.total_amount || 0)).toFixed(2)} บาท
                  </span>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">หมายเหตุ</h3>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg"
            >
              กลับไปช้อปปิ้ง
            </button>
            <button
              onClick={() => router.push('/bills/BillsListPage')}
              className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-200"
            >
              ดูใบเสร็จทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

