"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  trackingId: string;
  id: string;
  status: string;
  createdAt: string;
  productId?: string;
}

interface Report {
  dailySummary: { date: string; totalItems: number }[];
  statusSummary: { status: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [report, setReport] = useState<Report>({
    dailySummary: [],
    statusSummary: [],
  });
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newTrackingId, setNewTrackingId] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>("/api/Product", { withCredentials: true });
      setProducts(response.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get<Order[]>("/api/getOrders", { withCredentials: true });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setOrders([]);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await axios.get<Report>("/api/reportData", { withCredentials: true });
      setReport({
        dailySummary: response.data.dailySummary || [],
        statusSummary: response.data.statusSummary || [],
      });
    } catch (err) {
      console.error("❌ Error fetching report:", err);
      setReport({ dailySummary: [], statusSummary: [] });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReport();
  }, []);

  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setNewStatus(order.status);
    setNewTrackingId(order.trackingId || "");
  };

  const closeEditModal = () => {
    setEditOrder(null);
    setNewStatus("");
    setNewTrackingId("");
  };

  const handleUpdateOrder = async () => {
  if (!editOrder?.id) return;

  const validStatuses = ["Pending", "Processing", "Delivered", "Canceled", "Shipped"];
  const statusToSend = newStatus;

  if (!validStatuses.includes(statusToSend)) {
    alert(`❌ Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    return;
  }

  setLoading(true);

  try {
    const response = await axios.put(
      "/api/OrderAdmin",
      {
        orderId: editOrder.id,
        status: statusToSend,
        trackingId: newTrackingId.trim() || undefined,
      },
      { withCredentials: true }
    );

    console.log("✅ Order updated:", response.data);
    alert("✅ คำสั่งซื้ออัปเดตสำเร็จ!");
    closeEditModal();
    fetchOrders();
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.error("❌ Axios error:", {
        message: err.message ?? "No message",
        status: err.response?.status ?? "No status",
        data: err.response?.data ?? "No response data",
      });
      alert(`❌ Update failed: ${err.response?.data?.error || err.message}`);
    } else {
      console.error("❌ Unexpected error:", err);
      alert(`❌ Unexpected error: ${String(err)}`);
    }
  } finally {
    setLoading(false);
  }
};

function isAxiosError(error: unknown): error is { response?: any; message?: string } {
  return typeof error === "object" && error !== null && "response" in error;
}

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between">
        <Link href="/admin">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            🛠️ Product Edit
          </button>
        </Link>
        <Link href="/ProductUpload">
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            🆕 เพิ่มสินค้า
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">จัดการระบบ</h1>

      {/* Product Table */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">สินค้า</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ชื่อสินค้า</th>
              <th className="border border-gray-300 p-2">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2">{product.name}</td>
                <td className="border border-gray-300 p-2">฿{product.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Orders Table */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">คำสั่งซื้อ</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">รหัสคำสั่งซื้อ</th>
              <th className="border border-gray-300 p-2">สถานะ</th>
              <th className="border border-gray-300 p-2">Tracking ID</th>
              <th className="border border-gray-300 p-2">วันที่สั่งซื้อ</th>
              <th className="border border-gray-300 p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border border-gray-300">
                  <td className="border border-gray-300 p-2">{order.id}</td>
                  <td className="border border-gray-300 p-2">{order.status}</td>
                  <td className="border border-gray-300 p-2">{order.trackingId || "N/A"}</td>
                  <td className="border border-gray-300 p-2">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => openEditModal(order)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✏️ แก้ไข
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">❌ ไม่มีคำสั่งซื้อ</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">แก้ไขคำสั่งซื้อ</h2>
            <label className="block mb-2">สถานะ:</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Canceled">Canceled</option>
            </select>

            <label className="block mb-2">Tracking ID:</label>
            <input
              type="text"
              value={newTrackingId}
              onChange={(e) => setNewTrackingId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdateOrder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
