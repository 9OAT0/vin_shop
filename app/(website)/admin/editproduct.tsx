import React, { useState } from 'react';

const EditProductForm = () => {
  const [productName, setProductName] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError('');

    // Validate form data
    if (!productName || !size || !price || !details || !image) {
      setUploadError('Please fill in all fields.');
      setIsUploading(false);
      return;
    }
    if (isNaN(parseFloat(price))) {
      setUploadError('Price must be a number.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('size', size);
    formData.append('price', price);
    formData.append('details', details);
    formData.append('image', image);

    try {
      const response = await fetch('/api/products/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product updated successfully:', data);
      alert('Product updated successfully!'); // User feedback
      resetForm(); //Added helper function to reset the form

    } catch (error) {
      console.error('Error updating product:', error);
      setUploadError(`Error updating product: ${error.message}`);
    } finally {
      setIsUploading(false); // Ensure isUploading is always set to false
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleCancel = () => {
    resetForm(); //Use helper function to reset
  };

  const resetForm = () => {
    e.target.reset();
    setImage(null);
    setImagePreview(null);
    setProductName('');
    setSize('');
    setPrice('');
    setDetails('');
    setUploadError('');
    setIsUploading(false);
  };

  return (
    <div className="edit-product-form">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        </div>
        <div>
          <label>Size:</label>
          <input type="text" value={size} onChange={(e) => setSize(e.target.value)} required />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" step="0.01" value={price} onChange={handlePriceChange} required />
        </div>
        <div>
          <label>Details:</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} required />
        </div>
        <div>
          <label>Product Image:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && <img src={imagePreview} alt="Product Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
          {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
          {isUploading && <p>Uploading...</p>}
        </div>
        <button type="submit" disabled={isUploading}>SAVE</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default EditProductForm;