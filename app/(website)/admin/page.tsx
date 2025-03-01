"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  size: string;
  price: string;
  image: string;
  selected?: boolean; 
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>('/api/products'); // ระบุประเภทที่ถูกต้อง
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts(); // เรียกใช้ฟังก์ชันเมื่อคอมโพเนนต์ถูก mount
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setProducts(products.map(p => ({ ...p, selected: checked })));
  };

  const handleSelect = (id: number, checked: boolean) => {
    setProducts(
      products.map(p => (p.id === id ? { ...p, selected: checked } : p))
    );
  };

  const handleDeleteSelected = () => {
    setProducts(products.filter(p => !p.selected));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Edit Product</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={() => alert('Add Product functionality')}
          style={{
            marginRight: "10px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          ADD PRODUCTS
        </button>
        <button
          onClick={handleDeleteSelected}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ddd",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px"
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
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="checkbox"
                  checked={!!product.selected}
                  onChange={(e) => handleSelect(product.id, e.target.checked)}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <img src={product.image} alt={product.name} style={{ width: "50px", height: "50px" }} />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.size}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;