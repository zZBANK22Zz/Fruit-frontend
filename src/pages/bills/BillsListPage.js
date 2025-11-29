import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";

export default function BillsListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!apiUrl || !token) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/invoices/my-invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.invoices) {
          setInvoices(data.data.invoices);
        } else {
          setInvoices([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'ไม่สามารถโหลดใบเสร็จได้');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('เกิดข้อผิดพลาดในการโหลดใบเสร็จ');
    } finally {
      setLoading(false);
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
                  onClick={() => router.push(`/bills/BillPage?invoiceId=${invoice.id}`)}
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
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.order_status === 'paid' 
                          ? 'bg-green-100 text-green-700'
                          : invoice.order_status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.order_status === 'paid' ? 'ชำระแล้ว' : 
                         invoice.order_status === 'confirmed' ? 'ยืนยันแล้ว' :
                         invoice.order_status || 'รอดำเนินการ'}
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
    </div>
  );
}

