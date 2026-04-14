import React, { useState } from "react";
import OwnerSidebar from "../components/owner/OwnerSidebar";

const OwnerDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const stats = [
    { title: "Total Users", value: 1200, color: "#4f46e5" },
    { title: "Total Admins", value: 12, color: "#16a34a" },
    { title: "Total Orders", value: 530, color: "#f59e0b" },
    { title: "Revenue", value: "₹2,50,000", color: "#ef4444" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* Top Header */}
      <div
        style={{
          height: "84px",
          background: "#1e293b",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "6px",
            border: "1px solid #fff",
            background: "transparent",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        <h2 style={{ margin: 0 }}>👑 Owner Panel</h2>
      </div>

      {/* Sidebar */}
      <OwnerSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div style={{ padding: "30px" }}>
        <h1 style={{ marginBottom: "20px" }}>📊 Owner Dashboard</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {stats.map((item, index) => (
            <div
              key={index}
              style={{
                background: item.color,
                color: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{item.title}</h3>
              <h2 style={{ marginTop: "10px" }}>{item.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2>⚡ Quick Actions</h2>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => (window.location.href = "/owner/dashboard/users")}
              style={btnStyle}
            >
              👤 Manage Users
            </button>

            <button
              onClick={() => (window.location.href = "/owner/dashboard/admins")}
              style={btnStyle}
            >
              🛡️ Manage Admins
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>ℹ️ System Overview</h3>
          <p>
            Welcome to the Owner Panel. From here you can monitor users,
            admins, and system performance. Use the sidebar to navigate
            through different sections.
          </p>
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "6px",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

export default OwnerDashboard;