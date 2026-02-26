import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import OrangeSpinner from "../../components/OrangeSpinner";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function DeliveryConfirmPage() {
  const router = useRouter();
  const { qr_code } = router.query;
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (router.isReady && qr_code) {
      confirmDelivery(qr_code);
    } else if (router.isReady && !qr_code) {
      setError("Invalid QR Code / ไม่พบรหัส QR");
      setLoading(false);
    }
  }, [router.isReady, qr_code]);

  const confirmDelivery = async (token) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      // Note: No auth token needed as scanning the QR is the proof
      const response = await fetch(`${apiUrl}/api/orders/confirm-delivery/qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrToken: token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setOrderInfo(data.data.order);
      } else {
        setError(data.message || "Failed to confirm delivery / การยืนยันล้มเหลว");
      }
    } catch (err) {
      console.error("Error confirming delivery:", err);
      setError("Network error / เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>ยืนยันการรับสินค้า | Fruit WebApp</title>
      </Head>
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <OrangeSpinner className="w-16 h-16 mb-6" />
              <h2 className="text-xl font-black text-gray-800">กำลังตรวจสอบ...</h2>
              <p className="text-gray-500 font-medium mt-2">โปรดรอสักครู่</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">จัดส่งสำเร็จ!</h2>
              <p className="text-green-600 font-bold mb-6">ยืนยันการรับสินค้าเรียบร้อยแล้ว</p>
              
              {orderInfo && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-8 w-full text-left border border-gray-100">
                  <div className="mb-2 flex justify-between">
                    <span className="text-gray-500 text-sm font-bold">เลขที่ออเดอร์:</span>
                    <span className="text-gray-900 font-black">#{orderInfo.order_number}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-gray-500 text-sm font-bold">ชื่อผู้รับ:</span>
                    <span className="text-gray-900 font-bold">{orderInfo.username || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm font-bold">ยอดสุทธิ:</span>
                    <span className="text-orange-600 font-black">฿{parseFloat(orderInfo.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-black text-lg transition-all"
              >
                กลับสู่หน้าหลัก
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <XCircleIcon className="w-24 h-24 text-red-500 mb-6" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-red-600 font-bold mb-8 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-black text-lg transition-all"
              >
                กลับสู่หน้าหลัก
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
