"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Define types for product and order
interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
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
      const response = await axios.get('/api/getOrderAdmin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
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
      const apiUrl = `http://localhost:3001/api/orderFix/${editOrder.id}`;
  
      console.log("📡 Sending PUT request to:", apiUrl);
      console.log("📝 Data Sent:", { status: newStatus, trackingId: newTrackingId });
  
      const response = await axios.put(
        apiUrl,
        {
          status: newStatus.toUpperCase(), // ✅ Ensure status is in uppercase
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
    } catch (error) {
      console.error("❌ Error updating order:", error);
      console.error("🔎 Full error details:", error.response?.status, error.response?.data);
  
      if (error.response?.status === 400) {
        alert(`🚨 Update failed: ${error.response?.data?.error}`);
      } else if (error.response?.status === 500) {
        alert("❌ Server error, please check logs.");
      } else {
        alert(`❌ Unknown error: ${error.message}`);
      }
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

      {/* Order Management */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">คำสั่งซื้อ</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">รหัสคำสั่งซื้อ</th>
              <th className="border border-gray-300 p-2">สถานะ</th>
              <th className="border border-gray-300 p-2">วันที่สั่งซื้อ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2">{order.id}</td>
                <td className="border border-gray-300 p-2">{order.status}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

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
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
