// src/components/owner/OwnerLayout.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const OwnerLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/owner/login");
  };

  return (
    <div className="flex min-h-screen">

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white flex items-center gap-3 p-4 z-50">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
        <h1 className="font-bold">Owner Panel 👑</h1>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white p-4 z-50 transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          <Link onClick={() => setOpen(false)} to="/owner/dashboard">
            Dashboard
          </Link>
          <Link onClick={() => setOpen(false)} to="/owner/users">
            Users
          </Link>
          <Link onClick={() => setOpen(false)} to="/owner/admins">
            Admins
          </Link>
          <Link onClick={() => setOpen(false)} to="/owner/analytics">
            Analytics
          </Link>

          <Link onClick={() => setOpen(false)} to="/admin/dashboard">
            Admin Panel
          </Link>

          <Link onClick={() => setOpen(false)} to="/">
            User Panel
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-6 bg-red-500 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-gray-100 mt-16">
        {children}
      </div>
    </div>
  );
};

export default OwnerLayout;