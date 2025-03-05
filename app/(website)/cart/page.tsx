"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

interface Product {
  productName: string;
  id: string;
  cartId: string;
  productId: string;
  firstPicture: string;
}

interface CartDetails {
  id: string;
  userId: string;
  products: Product[];
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setAuthToken] = useState<string | null>(null);
  const [isOverlayVisible, setOverlayVisible] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null); // สำหรับจัดเก็บราคา
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null); // สำหรับจัดเก็บ URL ของ QR Code
  const [paymentData, setPaymentData] = useState<any | null>(null); // สำหรับเก็บข้อมูลการชำระเงิน
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedAuthToken = localStorage.getItem("token");

    setUserId(storedUserId);
    setAuthToken(storedAuthToken);

    const fetchCartItems = async () => {
      setLoading(true);
      try {
        if (storedUserId && storedAuthToken) {
          const response = await fetch(
            `/api/getCartDetails?userId=${storedUserId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${storedAuthToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data: CartDetails = await response.json();
            if (Array.isArray(data.products)) {
              setCartItems(data.products);
            } else {
              setCartItems([]);
              setErrorMessage("ได้รับข้อมูลที่ไม่ถูกต้องจากเซิร์ฟเวอร์");
            }
          } else {
            setErrorMessage(
              `ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้: ${response.statusText}`
            );
          }
        } else {
          setErrorMessage("โปรดเข้าสู่ระบบเพื่อดูตะกร้าสินค้า");
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(
            "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า: " + error.message
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!userId) {
      console.error("User ID is not available. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`/api/getCartDetails?userId=${userId}&productId=${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
        console.log(`Product with ID: ${productId} has been removed from the cart`);
      } else {
        const errorData = await response.json();
        console.error('Error deleting product:', errorData.error);
      }
    } catch (error) {
      console.error("Error during delete:", error.message);
    }
  };

  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

  

  const handlePayment = async () => {
    try {
      const response = await fetch(`/api/payment/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error occurred:", errorData.error);
        return;
      }

      const data = await response.json(); // รับข้อมูล JSON
      setPaymentData(data); // เก็บข้อมูลการชำระเงินลงใน state

      if (data.paymentLink) {
        setPaymentAmount(data.totalAmount); // ตั้งค่าราคา
        setQrCodeUrl(data.qrCodeUrl); // if available
        setOverlayVisible(true); // เปิด Overlay เพื่อแสดงข้อมูลการชำระเงิน
      } else {
        console.error("Payment link not found");
      }
    } catch (error) {
      console.error("Error during payment:", error.message);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedImage(file);
  };

  const handleUpload = async () => {
    if (!userId) {
      console.error("User ID is not available. Please log in again.");
      return;
    }

    if (selectedImage) {
      // ✅ ปิด Overlay ทันทีที่กด Upload
      setOverlayVisible(false);
      setUploadStatus("Uploading..."); // ✅ แจ้งให้ผู้ใช้รู้ว่าไฟล์กำลังอัปโหลด

      const formData = new FormData();
      formData.append("paymentSlip", selectedImage);
      formData.append("userId", userId);

      try {
        const response = await fetch("/api/CreateOrder", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Upload successful:", responseData);
          setUploadStatus("Upload successful ✅"); // ✅ แจ้งเตือนเมื่ออัปโหลดเสร็จ
        } else {
          const errorData = await response.json();
          console.error("Error uploading file:", errorData.error);
          setUploadStatus("Upload failed ❌");
        }
      } catch (error) {
        console.error("Error during upload:", error.message);
        setUploadStatus("Upload error ❌");
      }
    } else {
      console.error("No file selected");
      setUploadStatus("Please select a file ⚠️");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white text-black">
        <div className="flex flex-col gap-4">
          <Navbar />
          <div className="flex flex-col gap-5">
            <div className="pl-5">
              <h1 className="font-semibold text-xl">YOUR CART</h1>
            </div>

            {loading ? (
              <div className="pl-5">
                <h2 className="text-[14px]">กำลังโหลด...</h2>
              </div>
            ) : errorMessage ? (
              <div className="pl-5">
                <h2 className="text-red-600">{errorMessage}</h2>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="pl-5">
                <h2 className="text-[14px]">ตะกร้าของคุณว่างเปล่า...</h2>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="px-5 flex items-center justify-between"
                >
                  <Link
                    className="flex items-center cursor-pointer"
                    href={`/buy?id=${item.productId}`}
                  >
                    <img
                      src={item.firstPicture}
                      alt={item.productName}
                      className="w-16 h-16 object-cover mr-4"
                    />
                    <div>{item.productName}</div>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.productId)} // ใช้ productId แทน id
                    className="bg-red-500 text-white px-4 py-2 rounded transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}

            <div className="flex justify-center items-center">
              <button
                onClick={handlePayment} // เรียกใช้ handlePayment โดยตรง
                className="bg-black text-white w-32 h-10 flex justify-center items-center"
              >
                Make payment
              </button>
            </div>

            {isOverlayVisible && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={toggleOverlay}
              >
                <div
                  className="bg-white rounded-lg p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-bold">Make Payment</h2>
                  <p>รายละเอียดชำระเงิน...</p>
                  {paymentData &&
                    paymentData.paymentLink && ( // ใช้ paymentData
                      <img
                        src={paymentData.paymentLink}
                        alt="QR Code"
                        className="mt-4"
                      /> // แสดง QR Code
                    )}
                  <div>
                    ราคา:{" "}
                    {paymentAmount
                      ? `${paymentAmount} บาท`
                      : "กำลังโหลดราคา..."}{" "}
                    {/* แสดงราคา */}
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="mt-4" 
                  />
                  <div className="flex justify-between">
                    <button 
                      onClick={handleUpload} 
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Upload Image
                    </button>
                    <button
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                        onClick={toggleOverlay} // ปิด Overlay
                    >
                        ยกเลิก
                    </button>
                  </div>
                  
                </div>
              </div>
            )}

            <div className="pl-5">
              <a href="/" className="border-black border-b">
                กลับไปช็อปปิ้ง →
              </a>
            </div>
          </div>
          <img src="/Rectangle 271.png" alt="Banner" className="w-full h-12" />
        </div>
        <Footer />
      </div>
    </>
  );
}
