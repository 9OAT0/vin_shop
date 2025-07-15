"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

interface CartProduct {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  firstPicture: string | null;
}

export default function CartPage() {
  const [cart, setCart] = useState<{
    id: string;
    userId: string;
    totalProducts: number;
    products: CartProduct[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getCartDetails", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch cart");
      }

      const data = await res.json();
      setCart(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error fetching cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/getCartDetails?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to remove product");
      }

      fetchCart();
    } catch (err) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("Unexpected error");
      }
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/Payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onlyPayment: true }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Payment failed");
      }

      const data = await res.json();
      setPaymentLink(data.paymentLink);
      setTotalAmount(data.totalAmount);
      setPaymentModal(true);
    } catch (err) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("Unexpected error during payment");
      }
    }
  };

  const handleSlipUpload = async () => {
    if (!slipFile) {
      alert("Please upload a payment slip.");
      return;
    }

    const formData = new FormData();
    formData.append("paymentSlip", slipFile);

    setUploading(true);
    try {
      const res = await fetch("/api/Payment", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to confirm payment");
      }

      const result = await res.json();
      console.log("✅ Payment confirmed:", result);

      alert("Payment confirmed! Your order has been placed.");
      setPaymentModal(false);
      fetchCart();
    } catch (err) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("Unexpected error during payment confirmation");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!cart || cart.totalProducts === 0)
    return <div className="p-10">Cart is empty.</div>;

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Cart</h1>

        <ul className="space-y-4">
          {cart.products.map((item) => (
            <li
              key={item.id}
              className="flex items-center border p-4 rounded-lg shadow-sm"
            >
              {item.firstPicture ? (
                <Image
                  src={item.firstPicture}
                  alt={item.productName || "Product image"}
                  width={80}
                  height={80}
                  className="rounded mr-4"
                />
              ) : (
                <div className="w-[80px] h-[80px] bg-gray-200 mr-4 flex items-center justify-center text-sm text-gray-500 rounded">
                  No image
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Product ID: {item.productId}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handlePayment}
                >
                  Create Payment
                </button>

                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleRemove(item.productId)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Scan to Pay</h2>
            <Image
              src={paymentLink}
              alt="PromptPay QR Code"
              width={300}
              height={300}
              className="mx-auto rounded border"
            />
            <p className="mt-2 text-lg font-semibold">
              Total: ฿{totalAmount}
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSlipFile(e.target.files ? e.target.files[0] : null)
              }
              className="mt-4 w-full border p-2 rounded"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSlipUpload}
                disabled={uploading}
                className={`bg-green-600 text-white px-4 py-2 rounded ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "Uploading..." : "Confirm Payment"}
              </button>
              <button
                onClick={() => setPaymentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
