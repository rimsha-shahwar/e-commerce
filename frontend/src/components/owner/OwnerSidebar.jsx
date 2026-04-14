import React from "react";
import { Link, useNavigate } from "react-router-dom";

const OwnerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("owner");
    navigate("/owner/login");
  };

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#111",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* शीर्ष / Header */}
      <div>
        <h2 style={{ marginBottom: "20px" }}>👑 Owner Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            to="/owner/dashboard"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/owner/dashboard/users"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            👤 Manage Users
          </Link>

          <Link
            to="/owner/dashboard/admins"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            🛡️ Manage Admins
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "red",
          color: "#fff",
          border: "none",
          padding: "10px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default OwnerSidebar;