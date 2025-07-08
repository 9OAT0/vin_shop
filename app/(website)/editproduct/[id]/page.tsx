'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableImage from '../../components/SortableImage';

interface Product {
  id: string;
  name: string;
  price: number;
  size: string;
  description?: string;
  pictures: string[];
}

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(''); // ✅ แก้ NaN
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [pictures, setPictures] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<Product>('/api/Product', {
          params: { id },
          withCredentials: true,
        });
        const data = response.data;
        setName(data.name);
        setPrice(data.price);
        setSize(data.size);
        setDescription(data.description || '');
        setPictures(data.pictures || []);
        console.log('✅ Product fetched:', data);
      } catch (err: any) {
        console.error('❌ Error fetching product:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ✅ Upload new images
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  // ✅ Remove image from existing pictures
  const handleRemoveImage = (imageUrl: string) => {
    setPictures((prev) => prev.filter((pic) => pic !== imageUrl));
  };

  // ✅ Handle drag and drop sorting
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPictures((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // ✅ Submit update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('productId', id);
      formData.append('name', name);
      formData.append('price', price.toString());
      formData.append('size', size);
      formData.append('description', description);
      formData.append('remainingPictures', JSON.stringify(pictures)); // ✅ รูปเดิมที่เหลือ

      newImages.forEach((file) => {
        formData.append('pictures', file); // ✅ field 'pictures' สำหรับรูปใหม่
      });

      const response = await axios.put('/api/Product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      console.log('✅ Product updated:', response.data);
      alert('✅ Product updated successfully');
      router.push('/admin');
    } catch (err: any) {
      console.error('❌ Error updating product:', err.response?.data || err.message);
      alert(`❌ Failed to update product: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="p-4">⏳ Loading...</div>;
  if (error) return <div className="p-4 text-red-600">❌ {error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Price:</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={price ?? ''} // ✅ fallback
            onChange={(e) => setPrice(parseFloat(e.target.value) || '')}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Size:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            className="border p-2 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="block mb-1">Current Images (Drag to reorder):</label>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pictures} strategy={verticalListSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {pictures.map((pic) => (
                  <SortableImage
                    key={pic}
                    id={pic}
                    src={pic}
                    onRemove={handleRemoveImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div>
          <label className="block mb-1">Upload New Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="border p-2 w-full"
          />
          {newImages.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {newImages.length} new image(s) selected
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          💾 Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
