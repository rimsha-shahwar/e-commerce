import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { X, Edit, Trash2 } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", image: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔄 Fetch categories from backend
  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8000/categories");
    setCategories(res.data);
  };

  // ➕ Add category
  const handleAddCategory = async () => {
    if (!newCategory.name) return alert("Category name required!");

    try {
      await axios.post("http://localhost:8000/categories", newCategory); // wait for backend
      setNewCategory({ name: "", image: "" }); // reset form
      fetchCategories(); // refresh table
    } catch (err) {
      console.error("Failed to add category:", err);
      alert("Error adding category");
    }
  };

  // ✏️ Update category
  const handleUpdateCategory = async () => {
    await axios.put(
      `http://localhost:8000/categories/${editingCategory.id}`,
      editingCategory
    );
    setEditingCategory(null);
    fetchCategories();
  };

  // 🗑 Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    await axios.delete(`http://localhost:8000/categories/${id}`);
    fetchCategories();
  };

  // 📤 Image Upload (base64)
  const handleImageUpload = (e, setCategory) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategory((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>

      {/* ➕ Add New Category */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">Add Category</h3>

        {/* Category Name */}
        <div className="relative mb-2">
          <input
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="p-2 border rounded w-full pr-8"
          />
          {newCategory.name && (
            <button
              onClick={() => setNewCategory({ ...newCategory, name: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Image URL */}
        <div className="relative mb-2">
          <input
            placeholder="Image URL"
            value={newCategory.image.startsWith("data:") ? "" : newCategory.image}
            onChange={(e) =>
              setNewCategory({ ...newCategory, image: e.target.value })
            }
            className="p-2 border rounded w-full pr-8"
          />
          {newCategory.image && (
            <button
              onClick={() => setNewCategory({ ...newCategory, image: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, setNewCategory)}
          className="mb-2"
        />
        {newCategory.image && (
          <img
            src={newCategory.image}
            alt="preview"
            className="w-20 h-20 object-cover rounded mb-2"
          />
        )}

        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Category
        </button>
      </div>

      {/* 📋 Category List */}
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-3">
                {cat.image && (
                  <img
                    src={cat.image}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </td>
              <td className="p-3">{cat.name}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => setEditingCategory(cat)}
                  className="bg-yellow-400 px-3 py-1 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✏️ Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h3 className="font-bold mb-2">Edit Category</h3>
            <input
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              className="p-2 border w-full mb-2"
            />
            <input
              value={editingCategory.image.startsWith("data:") ? "" : editingCategory.image}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, image: e.target.value })
              }
              className="p-2 border w-full mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setEditingCategory)}
              className="mb-2"
            />
            {editingCategory.image && (
              <img
                src={editingCategory.image}
                alt="preview"
                className="w-20 h-20 object-cover rounded mb-2"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdateCategory}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Categories;