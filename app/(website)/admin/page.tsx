"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string; // ✅ ObjectId เป็น string
  name: string;
  size: string;
  price: string;
  pictures: string[];
  selected?: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>("/api/Product");
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProducts(products.map((p) => ({ ...p, selected: e.target.checked })));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, selected: checked } : p)));
  };

  const handleDeleteSelected = async () => {
    const selectedIds = products.filter((p) => p.selected).map((p) => p.id);

    if (selectedIds.length === 0) {
      alert("❌ Please select at least one product to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    const authToken = localStorage.getItem("token");

    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`/api/Product/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        )
      );

      alert("✅ Selected products deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting products:", error);
      alert("❌ Failed to delete selected products!");
    }
  };

  return (
    <>
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
              <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <input
                    type="checkbox"
                    checked={!!product.selected}
                    onChange={(e) => handleSelect(product.id, e.target.checked)}
                  />
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <Image
                    src={product.pictures[0] || "/placeholder.jpg"}
                    alt={product.name}
                    width={50} // ✅ Required by next/image
                    height={50}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.size}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.price}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => router.push(`/editproduct/${product.id}`)}
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
      <div className="pt-20 flex justify-center items-center">
        <a href="/dashBord" className="text-4xl font-bold">back</a>
      </div>
    </>
  );
};

export default ProductManagement;
