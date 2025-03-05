"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // ✅ ใช้ useRouter
import Image from "next/image";

interface Product {
  id: string; // ✅ เปลี่ยนเป็น string เนื่องจาก MongoDB ใช้ ObjectId
  name: string;
  size: string;
  price: string;
  pictures: string[];
  selected?: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter(); // ✅ ใช้ useRouter

  // ✅ ดึงข้อมูลสินค้าจาก API
  const fetchProducts = async () => {
    try {

      const response = await axios.get<Product[]>("/api/productGet");
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ เลือกสินค้าทั้งหมด
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProducts(products.map((p) => ({ ...p, selected: e.target.checked })));
  };

  // ✅ เลือกสินค้าทีละตัว
  const handleSelect = (id: string, checked: boolean) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, selected: checked } : p)));
  };

  // ✅ ลบสินค้าที่เลือก
  const handleDeleteSelected = async () => {
    const selectedIds = products.filter((p) => p.selected).map((p) => p.id);
  
    if (selectedIds.length === 0) {
      alert("❌ Please select at least one product to delete.");
      return;
    }
  
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} products?`
    );
  
    if (!confirmDelete) return;
  
    const authToken = localStorage.getItem("token"); // ✅ ดึง Token จาก localStorage
  
    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`/api/product_fix/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }, // ✅ ส่ง Token ไปกับคำขอ
          })
        )
      );
  
      alert("✅ Selected products deleted successfully!");
      fetchProducts(); // ✅ รีโหลดตาราง
    } catch (error) {
      console.error("❌ Error deleting products:", error);
      alert("❌ Failed to delete selected products! Check console for details.");
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Product Management</h1>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button
          onClick={() => alert("Add Product functionality")}
          style={{
            marginRight: "10px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          ADD PRODUCTS
        </button>
        <button
          onClick={handleDeleteSelected}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          DELETE
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Image</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Size</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              style={{ borderBottom: "1px solid #ddd", cursor: "pointer" }}
              onClick={() => router.push(`/editproduct/${product.id}`)} // ✅ คลิกแถวเพื่อแก้ไข
            >
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="checkbox"
                  checked={!!product.selected}
                  onClick={(e) => e.stopPropagation()} // ✅ ป้องกันคลิกแถวตอนเลือก checkbox
                  onChange={(e) => handleSelect(product.id, e.target.checked)}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <Image
                  src={product.pictures[0] || "/placeholder.jpg"} // ✅ ใช้ภาพ placeholder ถ้าไม่มี
                  alt={product.name}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.size}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.price}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/editproduct/${product.id}`);
                  }}
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
