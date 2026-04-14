import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen">

      {/* 🍔 Header with Hamburger (ALL DEVICES) */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center gap-3 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 border rounded hover:bg-gray-700"
        >
          <Menu />
        </button>
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      {/* 🌫️ Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* 📂 Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 flex flex-col z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/dashboard">Dashboard</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/add">Add Product</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/manage">Manage Products</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/categories">Categories</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/orders">Orders</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/users">Users</Link>
          <Link onClick={() => setSidebarOpen(false)} className="hover:bg-gray-700 p-2 rounded" to="/admin/content">Content Control</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* 📄 Main Content */}
      <div className="flex-1 p-6 bg-gray-100 mt-16">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;