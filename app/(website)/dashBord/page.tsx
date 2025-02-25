"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

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
  dailySummary: { date: string; totalItems: number; products: any }[];
  statusSummary: { status: string; count: number; products: any }[];
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
      const token = localStorage.getItem("token"); // Retrieve token
      const response = await axios.get('/api/getOrderAdmin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data); // Store orders
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch report
  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<Report>("/api/reportData", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReport(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.error("Unauthorized: Please log in again.");
      } else {
        console.error("Error fetching report:", err);
      }
    }
  };

  // Fetch products, orders, and reports when component mounts
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReport();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <section>
        <h2>Product Management</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.price}
              {/* Add buttons/actions for editing or deleting products */}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Order Management</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order ID: {order.id}, Status: {order.status}, Created At: {new Date(order.createdAt).toLocaleString()}
              {/* Add buttons/actions for updating orders */}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Monthly Report</h2>
        <h3>Daily Summary</h3>
        <ul>
          {report.dailySummary.map((summary) => (
            <li key={summary.date}>
              Date: {summary.date}, Total Items: {summary.totalItems}
            </li>
          ))}
        </ul>

        <h3>Status Summary</h3>
        <ul>
          {report.statusSummary.map((status) => (
            <li key={status.status}>
              Status: {status.status}, Count: {status.count}
              <ul>
                {status.products.map((product: any) => (
                  <li key={product.productId}>
                    {product.name} - Quantity: {product.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;