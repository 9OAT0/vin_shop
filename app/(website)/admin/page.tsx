"use client";

import React, { useState } from "react";

interface Product {
  id: number;
  name: string;
  size: string;
  price: string;
  image: string;
  selected?: boolean; 
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "I pledge allegiance to Jesus Christ.",
      size: "L",
      price: "400 ฿ / 11 $",
      image: "image_url",
    },
    // เพิ่มผลิตภัณฑ์เพิ่มเติมตามต้องการ
  ]);

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
      <h1>Edit Product</h1>
      <button onClick={() => alert('Add Product functionality')} style={{ marginRight: "10px" }}>
        ADD PRODUCTS
      </button>
      <button onClick={handleDeleteSelected}>DELETE</button>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th>Image</th>
            <th>Name</th>
            <th>Size</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>
                <input
                  type="checkbox"
                  checked={!!product.selected}
                  onChange={(e) => handleSelect(product.id, e.target.checked)}
                />
              </td>
              <td>
                <img src={product.image} alt={product.name} style={{ width: "50px", height: "50px" }} />
              </td>
              <td>{product.name}</td>
              <td>{product.size}</td>
              <td>{product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;