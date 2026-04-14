import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { X } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    brand: "",
    image: "",
    category: "",
    description: "",
    stock: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // 🔄 Fetch categories from backend
  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8000/categories");
    setCategories(res.data); // array of objects {id, name, image}
  };

  // 🔄 Fetch products from backend
  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:8000/products");
    setProducts(res.data);
  };

  // 🔥 DEBOUNCE LOGIC
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // 📤 Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setNewProduct((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // ➕ Add Product
  const handleAdd = async () => {
    if (!newProduct.category) return alert("Select category!");
    await axios.post("http://localhost:8000/products", {
      ...newProduct,
      price: Number(newProduct.price)
    });
    setShowAdd(false);
    setNewProduct({
      name: "",
      price: "",
      brand: "",
      image: "",
      category: "",
      description: "",
      stock: 0
    });
    fetchProducts();
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/products/${id}`);
    fetchProducts();
  };

  // ✏️ Update
  const handleUpdate = async () => {
    await axios.put(
      `http://localhost:8000/products/${editingProduct.id}`,
      editingProduct
    );
    setEditingProduct(null);
    fetchProducts();
  };

  // 🔍 Filtered products
  const filteredProducts = products.filter(
    (p) =>
      (!selectedCategory || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

      {/* 🔙 Back */}
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory(null)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded"
        >
          ⬅ Back
        </button>
      )}

      {/* 📦 CATEGORY VIEW */}
      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl cursor-pointer hover:scale-105 transition"
            >
              <h3 className="text-xl font-bold">{cat.name}</h3>
              <p className="text-sm mt-2">
                {products.filter((p) => p.category === cat.name).length} products
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* 📦 PRODUCT VIEW */
        <div className="bg-white rounded-xl shadow p-4">
          {/* 🔝 TOP BAR */}
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
            {/* 🔍 SEARCH WITH CLEAR */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* ➕ Add */}
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Product
            </button>
          </div>

          {/* ➕ ADD FORM */}
          {showAdd && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Add Product</h3>

              <input
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="p-2 border rounded w-full mb-2"
              />

              <input
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="p-2 border rounded w-full mb-2"
              />

              <input
                placeholder="Brand"
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
                className="p-2 border rounded w-full mb-2"
              />

              {/* Category */}
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="p-2 border rounded w-full mb-2"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* ✅ DESCRIPTION FIX */}
              <textarea
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
                className="p-2 border rounded w-full mb-2"
              />

              {/* ✅ STOCK FIX */}
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: Number(e.target.value),
                  })
                }
                className="p-2 border rounded w-full mb-2"
              />

              {/* Image */}
              <input
                placeholder="Image URL"
                value={
                  newProduct.image.startsWith("data:")
                    ? ""
                    : newProduct.image
                }
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
                className="p-2 border rounded w-full mb-2"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />

              {newProduct.image && (
                <img
                  src={newProduct.image}
                  alt=""
                  className="w-20 h-20 object-cover rounded mb-2"
                />
              )}

              <button
                onClick={handleAdd}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          )}

          {/* 📋 TABLE */}
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Category</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded" />}
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="bg-yellow-400 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✏️ EDIT MODAL */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded w-80">
                <h3 className="font-bold mb-2">Edit Product</h3>
                <input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="p-2 border w-full mb-2"
                />
                <input
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: e.target.value })
                  }
                  className="p-2 border w-full mb-2"
                />
                {/* Category Dropdown */}
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className="p-2 border rounded w-full mb-2"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* ✅ DESCRIPTION & STOCK FIELDS */}
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="p-2 border w-full mb-2"
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editingProduct.stock || 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: Number(e.target.value),
                    })
                  }
                  className="p-2 border w-full mb-2"
                  placeholder="Stock"
                />

                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-2 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-400 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageProducts;