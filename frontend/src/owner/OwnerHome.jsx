import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChartPie, FaUsers, FaUserShield } from "react-icons/fa";

const OwnerHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "System Overview",
      desc: "View total users, admins, orders & revenue",
      icon: <FaChartPie size={28} />,
      path: "/owner/dashboard/overview",
      color: "#4f46e5",
    },
    {
      title: "Manage Users",
      desc: "View, edit and manage all users",
      icon: <FaUsers size={28} />,
      path: "/owner/dashboard/users",
      color: "#16a34a",
    },
    {
      title: "Manage Admins",
      desc: "Control admin accounts & permissions",
      icon: <FaUserShield size={28} />,
      path: "/owner/dashboard/admins",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👑 Owner Dashboard</h1>
      <p style={styles.subtitle}>
        Central control panel to manage your entire system
      </p>

      <div style={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}
            onClick={() => navigate(card.path)}
          >
            <div style={{ ...styles.icon, color: card.color }}>
              {card.icon}
            </div>

            <h2 style={styles.cardTitle}>{card.title}</h2>
            <p style={styles.cardDesc}>{card.desc}</p>

            <button style={{ ...styles.button, background: card.color }}>
              Open →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  },
  icon: {
    marginBottom: "15px",
  },
  cardTitle: {
    marginBottom: "10px",
  },
  cardDesc: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "15px",
  },
  button: {
    border: "none",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default OwnerHome;