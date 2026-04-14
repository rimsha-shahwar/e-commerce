import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaUserShield,
  FaShoppingCart,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

const OwnerSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("owner");
    localStorage.removeItem("ownerToken");
    navigate("/owner/login");
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          width: "240px",
          height: "100vh",
          background: "#111827",
          color: "#fff",
          padding: "20px",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#fff" }}>👑 Owner Panel</h2>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <Link
          to="/owner/dashboard"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaChartBar /> Dashboard
        </Link>

        <Link
          to="/owner/dashboard/admins"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaUserShield /> Admins
        </Link>

        <Link
          to="/owner/dashboard/users"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaUsers /> Users
        </Link>

        <Link
          to="/owner/dashboard/orders"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaShoppingCart /> Orders
        </Link>

        <Link
          to="/owner/dashboard/analytics"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaChartLine /> Analytics
        </Link>

        <Link
          to="/owner/dashboard/settings"
          style={styles.link}
          onClick={() => setIsOpen(false)}
        >
          <FaCog /> Settings
        </Link>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </>
  );
};

const styles = {
  link: {
    color: "#ddd",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "6px",
    transition: "0.3s",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "10px",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
  },
};

export default OwnerSidebar;