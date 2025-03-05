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

// Define types for product and order
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

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>("/api/productGet");
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Token not found in localStorage");
        alert("❌ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      console.log("📌 Fetching orders with token:", token);

      const response = await axios.get<Order[]>("/api/getOrderAdmin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data); // ✅ Now TypeScript knows response.data is an Order[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // ✅ Explicitly type `error`
      console.error(
        "❌ Error fetching orders:",
        error.response?.data || error.message
      );
      alert("❌ ไม่สามารถโหลดคำสั่งซื้อได้");
    }
  };

  // Fetch report
  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<Report>("/api/reportData", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(response.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  // Fetch products, orders, and reports when component mounts
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReport();
  }, []);

  // Colors for Pie Chart
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setNewStatus(order.status);
    setNewTrackingId(order.trackingId || "");
  };

  // ปิด Modal
  const closeEditModal = () => {
    setEditOrder(null);
    setNewStatus("");
    setNewTrackingId("");
  };

  // ฟังก์ชันอัปเดตคำสั่งซื้อผ่าน API
  const handleUpdateOrder = async () => {
    if (!editOrder || !editOrder.id) {
      alert("❌ กรุณาเลือกคำสั่งซื้อก่อนอัปเดต");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = `/api/orders/update`;

      console.log("📡 Sending PUT request to:", apiUrl);
      console.log("📝 Data Sent:", {
        orderId: editOrder.id,
        status: newStatus,
        trackingId: newTrackingId,
      });

      const response = await axios.put(
        apiUrl,
        {
          orderId: editOrder.id,
          status: newStatus.toUpperCase(),
          trackingId: newTrackingId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Order updated successfully:", response.data);
      alert("✅ อัปเดตคำสั่งซื้อสำเร็จ!");
      setEditOrder(null);
      fetchOrders();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error updating order:", error);
      alert(
        `❌ Update failed: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      {/* ✅ TabBar Navigation */}
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

      {/* Product Management */}
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

      {/* ✅ Order Management */}
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
            {orders.map((order) => (
              <tr key={order.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2">{order.id}</td>
                <td className="border border-gray-300 p-2">{order.status}</td>
                <td className="border border-gray-300 p-2">
                  {order.trackingId || "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => openEditModal(order)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ✏️ แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ✅ Order Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">แก้ไขคำสั่งซื้อ</h2>
            <label className="block mb-2">สถานะ:</label>
            <input
              type="text"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
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
              >
                {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">รายงาน</h2>

        {/* Daily Summary Graph */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">คำสั่งซื้อรายวัน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.dailySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalItems" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Summary Graph */}
        <div>
          <h3 className="text-lg font-semibold mb-2">สรุปสถานะคำสั่งซื้อ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report.statusSummary}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              >
                {report.statusSummary.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
