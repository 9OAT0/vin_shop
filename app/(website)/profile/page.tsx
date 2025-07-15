"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface User {
  id: string;
  name: string;
  phoneNumber: string | null;
  location: string | null;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  trackingId: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");

  const fetchProfileData = async () => {
    try {
      const resUser = await axios.get<User>("/api/me", { withCredentials: true });
      console.log("✅ Fetched user:", resUser.data);
      setUser(resUser.data);

      const resOrders = await axios.get<Order[]>("/api/getOrders", { withCredentials: true });
      console.log("✅ Fetched orders:", resOrders.data);
      setOrders(resOrders.data);
    } catch (err) {
      console.error("❌ Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    const payload: Partial<User> = {};
    if (editedName.trim()) payload.name = editedName.trim();
    if (editedPhone.trim()) payload.phoneNumber = editedPhone.trim();
    if (editedAddress.trim()) payload.location = editedAddress.trim();

    if (Object.keys(payload).length === 0) {
      alert("⚠️ Please edit at least one field before saving.");
      return;
    }

    try {
      console.log("📡 Updating user with:", payload);

      const res = await axios.put("/api/userFix", payload, { withCredentials: true });
      console.log("✅ Profile updated:", res.data);

      alert("Profile updated successfully!");
      setEditedName("");
      setEditedPhone("");
      setEditedAddress("");
      fetchProfileData(); // Reload profile
    } catch (err: any) {
      console.error("❌ API Error:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      alert("Failed to update profile: " + (err?.response?.data?.error || "Unknown error"));
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-black">
        <div className="p-6 max-w-3xl mx-auto">
          {/* ✅ Username */}
          <h1 className="text-3xl font-bold mb-6">Username: {user?.name || "N/A"}</h1>

          {/* ✅ Current Location */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">📍 My Current Location</h2>
            <div className="border rounded p-4 bg-gray-50">
              <p><strong>Name:</strong> {user?.name || "N/A"}</p>
              <p><strong>Phone:</strong> {user?.phoneNumber || "N/A"}</p>
              <p><strong>Address:</strong> {user?.location || "N/A"}</p>
            </div>
          </div>

          {/* ✅ Edit Location */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Edit Your Information</h2>
            <div className="flex flex-col gap-2">
              <label>Name</label>
              <input
                type="text"
                placeholder={user?.name || "Enter your name"}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border border-gray-400 p-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder={user?.phoneNumber || "Enter phone number"}
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="border border-gray-400 p-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Address</label>
              <input
                type="text"
                placeholder={user?.location || "Enter address"}
                value={editedAddress}
                onChange={(e) => setEditedAddress(e.target.value)}
                className="border border-gray-400 p-2 rounded w-full"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>

          {/* ✅ Order History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📦 Order History</h2>
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li key={order.id} className="border p-3 rounded">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Tracking ID:</strong> {order.trackingId || "N/A"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}