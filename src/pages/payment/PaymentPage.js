import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  PhotoIcon,
  XMarkIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import { notifySuccess } from "../../utils/notificationUtils";
import { compressImage, validateImageFile } from "../../utils/imageUtils";

export default function PaymentPage() {
  const router = useRouter();
  const { orderId, amount } = router.query;
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Slip Upload State
  const [slipImage, setSlipImage] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadQRCode = async () => {
      if (!orderId && !amount) {
        setError('ไม่พบข้อมูลการสั่งซื้อ กรุณาสั่งซื้อใหม่');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        const token = localStorage.getItem('token');

        if (!apiUrl) {
          setError('API configuration missing');
          setLoading(false);
          return;
        }

        // If orderId is provided, fetch QR code from API
        if (orderId) {
          if (!token) {
            setError('กรุณาเข้าสู่ระบบก่อน');
            setLoading(false);
            return;
          }

          const response = await fetch(`${apiUrl}/api/orders/${orderId}/qr-code`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              setQrCode(data.data.qr_code);
              setPaymentAmount(parseFloat(data.data.amount));
            } else {
              setError('ไม่พบข้อมูล QR Code');
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.message || 'ไม่สามารถโหลด QR Code ได้');
          }
        } else if (amount) {
          // Fallback: If only amount is provided (shouldn't happen in normal flow)
          setPaymentAmount(parseFloat(amount));
          setError('กรุณาสร้างออเดอร์ก่อนทำการชำระเงิน');
        }
      } catch (error) {
        console.error('Error loading QR code:', error);
        setError('เกิดข้อผิดพลาดในการโหลด QR Code');
      } finally {
        setLoading(false);
      }
    };

    loadQRCode();
  }, [orderId, amount]);

  const handleSlipChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      try {
        setIsUploading(true);
        const compressedBase64 = await compressImage(file, 1200, 1200, 0.7);
        setSlipImage(`data:image/jpeg;base64,${compressedBase64}`);
        setSlipPreview(URL.createObjectURL(file));
      } catch (err) {
        console.error('Error processing slip image:', err);
        alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeSlip = () => {
    setSlipImage(null);
    setSlipPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaymentCompleted = async () => {
    if (!orderId) {
      router.push('/bills/BillsListPage');
      return;
    }

    if (!slipImage) {
      alert('กรุณาแนบหลักฐานการโอนเงิน (Slip)');
      return;
    }

    if (isConfirming) return;

    try {
      setIsConfirming(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const token = localStorage.getItem('token');

      if (!apiUrl || !token) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        setIsConfirming(false);
        return;
      }

      // 1. Upload Slip First
      const uploadResponse = await fetch(`${apiUrl}/api/orders/${orderId}/upload-slip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: slipImage,
          amount: paymentAmount,
          payment_date: new Date().toISOString(),
          notes: paymentNotes
        }),
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        throw new Error(uploadError.message || 'ไม่สามารถอัปโหลดสลิปได้');
      }

      // 2. Confirm payment
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const orderData = data.data?.order;
        const totalAmount = orderData?.total_amount || paymentAmount;
        
        notifySuccess(
          'ชำระเงินสำเร็จ',
          `การชำระเงินสำหรับออเดอร์ #${orderId} สำเร็จแล้ว จำนวน ${parseFloat(totalAmount).toFixed(2)} บาท`
        );
        
        router.push(`/bills/BillPage?orderId=${orderId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'ไม่สามารถยืนยันการชำระเงินได้');
        setIsConfirming(false);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert(error.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">กำลังโหลด QR Code...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar showBackButton={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              กลับ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-white flex flex-col">
      <Navbar showBackButton={true} />

      <div className="flex-1 overflow-y-auto pb-64">
        {/* Title */}
        <div className="text-center py-8 px-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">ชำระเงิน</h1>
          </div>
          <p className="text-gray-600 text-sm font-medium">สแกน QR Code และแนบสลิปเพื่อยืนยัน</p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-2 shadow-lg">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-700">Order</span>
              </div>
              <div className="flex-1 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 mx-2 max-w-[80px] rounded-full"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-2 shadow-xl ring-4 ring-orange-100 animate-pulse-glow">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-orange-600">Payment</span>
              </div>
              <div className="flex-1 h-1.5 bg-gray-200 mx-2 max-w-[80px] rounded-full"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2 border-2 border-gray-300">
                </div>
                <span className="text-xs font-bold text-gray-400">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="px-6 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">สแกน QR Code เพื่อชำระเงิน</h2>
              <p className="text-sm text-gray-600 font-medium">เปิดแอปธนาคารของคุณและสแกน QR Code</p>
            </div>
            
            {qrCode ? (
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-gray-200 transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={qrCode}
                    alt="PromptPay QR Code"
                    className="w-full max-w-[300px] mx-auto block"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[300px] mx-auto aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto bg-white border-4 border-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <svg className="w-24 h-24 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2.01M19 8h2M5 20h2.01M19 20h2M12 8h.01M12 16h.01" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">กำลังโหลด QR Code...</p>
                </div>
              </div>
            )}

            <div className="mt-8 text-center bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <p className="text-gray-700 text-sm mb-1 font-semibold">จำนวนเงินที่ต้องชำระ</p>
              <p className="text-4xl font-extrabold text-orange-600">
                {paymentAmount.toFixed(2)} <span className="text-lg">บาท</span>
              </p>
            </div>
          </div>
        </div>

        {/* Slip Upload Section */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">แนบหลักฐานการโอนเงิน</h2>
            </div>

            <div className="space-y-4">
              {!slipPreview ? (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-gray-100 hover:border-orange-400 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <PhotoIcon className="w-7 h-7 text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">คลิกเพื่ออัปโหลดรูปภาพสลิป</p>
                    <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (สูงสุด 5MB)</p>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 shadow-lg">
                  <img src={slipPreview} alt="Slip Preview" className="w-full aspect-video object-cover" />
                  <button
                    onClick={removeSlip}
                    className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 text-center">
                    <span className="text-white text-xs font-bold">เลือกรูปภาพแล้ว</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSlipChange}
                accept="image/*"
                className="hidden"
              />

              {/* Notes */}
              <div className="pt-2">
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4 text-gray-400" />
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="เช่น โอนจากธนาคาร..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-orange-400 focus:outline-none transition-colors text-sm resize-none h-24 bg-gray-50/50"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="px-6 mb-6">
          <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <InformationCircleIcon className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-2">คำชี้แจง</h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  กรุณาตรวจสอบยอดเงินและเบอร์พร้อมเพย์ให้ถูกต้องก่อนโอนเงิน หลังจากโอนเรียบร้อยแล้ว **ต้องแนบหลักฐานการโอน** เพื่อให้เจ้าหน้าที่ตรวจสอบและออกใบเสร็จรับเงิน
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] z-40 safe-area-bottom">
        <div className="p-4 sm:p-6 space-y-3">
          <button
            onClick={handlePaymentCompleted}
            disabled={!orderId || isConfirming || !slipImage || isUploading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
          >
            {isConfirming ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังดำเนินการ...</span>
              </>
            ) : isUploading ? (
              <>
                <div className="w-6 h-6 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <span>กำลังโหลดสลิป...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                <span>ยืนยันการชำระเงิน</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => router.back()}
            disabled={isConfirming}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}

