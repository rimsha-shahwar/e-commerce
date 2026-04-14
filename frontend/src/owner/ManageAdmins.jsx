import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const toggleBlock = async (id, isActive) => {
    try {
      if (isActive) {
        await axios.put(`http://localhost:8000/admins/block/${id}`);
      } else {
        await axios.put(`http://localhost:8000/admins/unblock/${id}`);
      }
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* 🔙 BACK */}
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <h2 style={styles.heading}>🛡️ Manage Admins</h2>

      {/* 🔍 SEARCH */}
      <div style={styles.searchBox}>
        <FaSearch />
        <input
          type="text"
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        {search && (
          <FaTimes onClick={() => setSearch("")} style={{ cursor: "pointer" }} />
        )}
      </div>

      {/* 📋 TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Orders</th>
              <th style={styles.th}>Revenue</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredAdmins.map((admin, i) => (
              <tr key={admin.id} style={styles.row}>
                <td style={styles.td}>{admin.id}</td>
                <td style={styles.td}>{admin.name}</td>
                <td style={styles.td}>{admin.email}</td>
                <td style={styles.td}>{admin.orders}</td>
                <td style={styles.td}>₹{admin.revenue}</td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: admin.is_active ? "#16a34a" : "#ef4444",
                    }}
                  >
                    {admin.is_active ? "Active" : "Blocked"}
                  </span>
                </td>

                <td style={styles.td}>
                  <button
                    onClick={() =>
                      toggleBlock(admin.id, admin.is_active)
                    }
                    style={{
                      ...styles.button,
                      background: admin.is_active ? "#ef4444" : "#16a34a",
                    }}
                  >
                    {admin.is_active ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAdmins.length === 0 && (
          <p style={styles.noData}>No admins found</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "20px" },
  heading: { marginBottom: "15px" },

  backBtn: {
    marginBottom: "10px",
    padding: "6px 12px",
    cursor: "pointer",
  },

  searchBox: {
    display: "flex",
    gap: "10px",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  input: { flex: 1, border: "none", outline: "none" },

  tableWrapper: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
  },

  table: { width: "100%", borderCollapse: "collapse" },

  th: { padding: "10px", borderBottom: "2px solid #eee" },
  td: { padding: "10px", textAlign: "center" },

  row: { borderBottom: "1px solid #eee" },

  badge: {
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "6px",
  },

  button: {
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  noData: { textAlign: "center", marginTop: "10px" },
};

export default ManageAdmins;