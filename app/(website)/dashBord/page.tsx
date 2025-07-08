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

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>("/api/Product", { withCredentials: true });
      setProducts(response.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get<Order[]>("/api/getOrders", { withCredentials: true });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setOrders([]); // fallback
    }
  };

  // ✅ Fetch Report
  const fetchReport = async () => {
    try {
      const response = await axios.get<Report>("/api/reportData", { withCredentials: true });
      setReport({
        dailySummary: response.data.dailySummary || [],
        statusSummary: response.data.statusSummary || [],
      });
    } catch (err) {
      console.error("❌ Error fetching report:", err);
      setReport({ dailySummary: [], statusSummary: [] }); // fallback
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

    setLoading(true);

    try {
      const response = await axios.put("/api/OrderAdmin", {
        orderId: editOrder.id,
        status: newStatus,
        trackingId: newTrackingId || null,
      }, { withCredentials: true });

      console.log("✅ Order updated:", response.data);
      alert("✅ คำสั่งซื้อถูกอัปเดตเรียบร้อยแล้ว");
      closeEditModal();
      fetchOrders();
    } catch (err) {
      console.error("❌ Error updating order:", err);
      alert("❌ ไม่สามารถอัปเดตคำสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between">
        <Link href="/admin">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            🛠️ Product Edit
          </button>
        </Link>
        <Link href="/Product">
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            🆕 เพิ่มสินค้า
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">จัดการระบบ</h1>

      {/* ✅ Product Table */}
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

      {/* ✅ Orders Table */}
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
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  ❌ ไม่มีคำสั่งซื้อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ✅ Report Charts */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">รายงาน</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">คำสั่งซื้อรายวัน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.dailySummary || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalItems" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">สรุปสถานะคำสั่งซื้อ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report.statusSummary || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(report.statusSummary || []).map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={colors[idx % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ✅ Edit Modal */}
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
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Canceled</option>
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
