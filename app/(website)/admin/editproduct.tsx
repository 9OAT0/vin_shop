"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
}

const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>(); 
  const history = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get<Product>(`/api/productGet/${productId}`);
      setProduct(response.data);
    } catch (err) {
      setError("Error fetching product details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle product update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      await axios.put(`/api/productUpdate/${productId}`, product);
      history.push('/dashboard'); 
    } catch (err) {
      setError("Error updating product");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Edit Product</h1>
      {product && (
        <form onSubmit={handleUpdate}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Price:</label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              required
            />
          </div>
          <button type="submit">Update Product</button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;