import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUserShield,
  FaShoppingCart,
  FaRupeeSign,
  FaArrowLeft
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const OwnerOverview = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/analytics`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  // Chart data (mock growth trend)
  const chartData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Orders", value: stats.orders },
  ];

  const revenueData = [
    { name: "Revenue", value: stats.revenue },
  ];

  const cards = [
    { title: "Total Users", value: stats.users, icon: <FaUsers />, color: "#4f46e5" },
    { title: "Total Admins", value: stats.admins, icon: <FaUserShield />, color: "#16a34a" },
    { title: "Total Orders", value: stats.orders, icon: <FaShoppingCart />, color: "#f59e0b" },
    { title: "Revenue", value: `₹${stats.revenue}`, icon: <FaRupeeSign />, color: "#ef4444" },
  ];

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <h1>📊 System Overview</h1>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={i} style={styles.card}>
            <div style={{ ...styles.iconBox, background: card.color }}>
              {card.icon}
            </div>
            <div>
              <h4 style={styles.title}>{card.title}</h4>
              <h2>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartContainer}>

        {/* Users/Admin/Orders Chart */}
        <div style={styles.chartBox}>
          <h3>📈 Growth Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4f46e5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div style={styles.chartBox}>
          <h3>💰 Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    background: "linear-gradient(135deg, #eef2f7, #e5e7eb)",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  iconBox: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  title: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },

  chartContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  chartBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
};

export default OwnerOverview;