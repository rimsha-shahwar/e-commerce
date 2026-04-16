import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { ImagePlus, Upload } from "lucide-react";
import imageCompression from "browser-image-compression"; // ✅ new
import API_BASE_URL from "../config";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    image: "",
    description: "",
    stock: 0
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  // 📤 Image Upload (compressed base64)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // ✅ Compress image to max 1MB and max dimension 800px
      const options = { maxSizeMB: 1, maxWidthOrHeight: 800 };
      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({
          ...prev,
          image: reader.result // base64 string
        }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Failed to upload image. Try a smaller file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price) {
      alert("Name and Price are required!");
      return;
    }

    try {
      setLoading(true);

      // Send product to backend
      await axios.post(`${API_BASE_URL}/products`, {
        ...product,
        price: Number(product.price)
      });

      // ✅ Show success message
      setSuccess(true);

      // Reset form
      setProduct({
        name: "",
        price: "",
        category: "",
        brand: "",
        image: ""
      });

      // Hide message after 3 sec
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error(error);
      alert("❌ Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h2 className="text-3xl font-bold mb-6">Add New Product</h2>

          {/* ✅ Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
              ✅ Product added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <input
              name="name"
              placeholder="Product Name"
              value={product.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Price */}
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={product.price}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Category */}
            <input
              name="category"
              placeholder="Category"
              value={product.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Brand */}
            <input
              name="brand"
              placeholder="Brand (e.g. Nike, Apple)"
              value={product.brand}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Product Description"
              value={product.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            {/* Image URL */}
            <div>
              <label className="text-sm text-gray-600">Image URL</label>
              <div className="flex items-center gap-2 mt-1">
                <ImagePlus className="text-gray-400" />
                <input
                  name="image"
                  placeholder="Paste image URL"
                  value={product.image.startsWith("data:") ? "" : product.image}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="text-sm text-gray-600">Or Upload Image</label>
              <div className="flex items-center gap-2 mt-1">
                <Upload className="text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
              </div>
            </div>

            {/* Preview */}
            {product.image && (
              <div>
                <p className="text-sm text-gray-500">Preview:</p>
                <img
                  src={product.image}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-lg border mt-2"
                />
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;