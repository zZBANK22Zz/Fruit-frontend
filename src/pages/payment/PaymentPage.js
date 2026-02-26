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
import OrangeSpinner from "../../components/OrangeSpinner";
import { useLanguage } from "../../utils/LanguageContext";

export default function PaymentPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
          setError('ไม่พบการตั้งค่า API');
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

      // Guard against accidental base64 in orderID
      if (orderId && orderId.length > 500) {
        console.error('Invalid orderId detected (too long).');
        alert('เกิดข้อผิดพลาด: ข้อมูลออเดอร์ไม่ถูกต้อง');
        setIsConfirming(false);
        return;
      }

      console.log(`Sending slip to: ${apiUrl}/api/orders/${orderId}/upload-slip`);

      // 1. Upload Slip (This also confirms payment on the backend)
      const uploadResponse = await fetch(`${apiUrl}/api/orders/${orderId}/upload-slip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: slipImage, // Large base64 string sent in body, NOT URL
          amount: paymentAmount,
          payment_date: new Date().toISOString(),
          notes: paymentNotes
        }),
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        const totalAmount = data.data?.amount || paymentAmount;
        
        notifySuccess(
          t('uploadSuccess'),
          t('uploadSuccessDesc', parseFloat(totalAmount).toFixed(2))
        );
        
        // Redirect to bill page - The backend already updated status to 'processing' or 'paid'
        router.push(`/bills/BillPage?orderId=${orderId}`);
      } else {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        throw new Error(uploadError.message || 'ไม่สามารถอัปโหลดสลิปได้');
      }

    } catch (error) {
      console.error('Payment error:', error);
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
            <OrangeSpinner className="w-16 h-16 mx-auto mb-4" />
            <div className="text-gray-500">{t('loadingQR')}</div>
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
              {t('back')}
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('payment')}</h1>
          </div>
          <p className="text-gray-600 text-sm font-medium">{t('paymentSubtitle')}</p>
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

        {/* QR Code Section - Premium Thai QR Template */}
        <div className="px-6 mb-6">
          <div className="max-w-md mx-auto bg-[#f0f1f3] rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Template Header */}
            <div className="w-full">
              <img 
                src="/thai-qr-header.jpg" 
                alt="Thai QR Payment Header" 
                className="w-full h-auto block"
              />
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {/* PromptPay Logo */}
              <div className="mb-6">
                <img 
                  src="/promptpay-logo.png" 
                  alt="PromptPay" 
                  className="h-12 w-auto"
                />
              </div>

              {/* QR Code with Center Logo */}
              <div className="relative bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100 mb-6">
                {qrCode ? (
                  <>
                    <img
                      src={qrCode}
                      alt="PromptPay QR Code"
                      className="w-64 h-64 block"
                    />
                    {/* Fixed Logic for Center Logo Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-sm">
                      <img 
                        src="/qr-center-logo.png" 
                        alt="QR Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                    <OrangeSpinner className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Payment Details Text */}
              <div className="text-center space-y-2">
                <p className="text-[#555a60] text-sm font-medium">{t('scanQRInstruction')}</p>
                <h3 className="text-xl font-bold text-gray-800">นาย พงษ์ศักดิ์ เมฆอรุณ</h3>
                <div className="flex flex-col gap-1 text-[#666c72] text-sm">
                  <p>เบอร์โทรศัพท์มือถือ xxx-xxx-4394</p>
                  <p>เลขที่บัญชี 0201xxxx3688</p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mt-8 w-full bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-inner text-center">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{t('amountToPay')}</p>
                <p className="text-3xl font-black text-orange-600">
                  {paymentAmount.toFixed(2)} <span className="text-lg">บาท</span>
                </p>
              </div>
            </div>
            
            {/* Security Note Footer image-like text */}
            <div className="bg-gray-100/50 py-3 px-6 border-t border-gray-200 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.908-3.067 9.126-7.403 10.796a.75.75 0 01-.594 0C5.667 16.126 2.6 11.908 2.6 7.001c0-.68.056-1.35.166-2.002zm7.084 10.64a10.454 10.454 0 005.164-8.639c0-.528-.033-1.047-.1-1.552a10.458 10.458 0 01-4.148-2.618 10.458 10.458 0 01-4.148 2.618 10.453 10.453 0 00-.1 1.552 10.454 10.454 0 005.164 8.639z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Payment Transaction</span>
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
              <h2 className="text-xl font-bold text-gray-900">{t('attachSlip')}</h2>
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
                    <p className="text-sm font-bold text-gray-700">{t('clickToUploadSlip')}</p>
                     <p className="text-xs text-gray-400 mt-1">{t('supportedFormats')}</p>
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
                    <span className="text-white text-xs font-bold">{t('imageSelected')}</span>
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
                  {t('additionalNotes')}
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
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
                <h3 className="text-sm font-bold text-blue-900 mb-2">{t('instructionTitle')}</h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {t('instructionText')}
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
                <OrangeSpinner className="w-6 h-6" />
                <span>{t('processing')}</span>
              </>
            ) : isUploading ? (
              <>
                <OrangeSpinner className="w-6 h-6" />
                <span>{t('loadingSlip')}</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                <span>{t('confirmPayment')}</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => router.back()}
            disabled={isConfirming}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}

