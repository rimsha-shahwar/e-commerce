import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✅ import
import API_BASE_URL from "../config";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // ✅ hook

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id, isActive) => {
    try {
      if (isActive) {
        await axios.put(`${API_BASE_URL}/users/block/${id}`);
      } else {
        await axios.put(`${API_BASE_URL}/users/unblock/${id}`);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.is_active === b.is_active) {
        return a.id - b.id;
      }
      return a.is_active ? -1 : 1;
    });

  return (
    <div style={styles.container}>
      {/* ✅ HEADER WITH BACK BUTTON */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ⬅ Back
        </button>

        <h2 style={styles.heading}>👤 Manage Users</h2>
      </div>

      {/* SEARCH BAR */}
      <div style={styles.searchBox}>
        <FaSearch />

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        {search && (
          <FaTimes
            style={styles.clearIcon}
            onClick={() => setSearch("")}
          />
        )}
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "5%" }}>ID</th>
              <th style={{ ...styles.th, width: "20%" }}>Name</th>
              <th style={{ ...styles.th, width: "35%" }}>Email</th>
              <th style={{ ...styles.th, width: "20%" }}>Status</th>
              <th style={{ ...styles.th, width: "20%" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, i) => (
              <tr
                key={user.id}
                style={{
                  ...styles.row,
                  background: i % 2 === 0 ? "#fafafa" : "#fff",
                }}
              >
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: user.is_active ? "#16a34a" : "#ef4444",
                    }}
                  >
                    {user.is_active ? "Active" : "Blocked"}
                  </span>
                </td>

                <td style={styles.td}>
                  <button
                    onClick={() => toggleBlock(user.id, user.is_active)}
                    style={{
                      ...styles.button,
                      background: user.is_active ? "#ef4444" : "#16a34a",
                    }}
                  >
                    {user.is_active ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p style={styles.noData}>No users found</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },

  backButton: {
    padding: "6px 12px",
    border: "none",
    background: "#333",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  heading: {
    fontSize: "22px",
    margin: 0,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  input: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: "14px",
  },

  clearIcon: {
    cursor: "pointer",
    color: "#999",
  },

  tableWrapper: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  th: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "600",
    borderBottom: "2px solid #eee",
  },

  td: {
    padding: "12px",
    textAlign: "center",
  },

  row: {
    borderBottom: "1px solid #eee",
  },

  badge: {
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },

  button: {
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },

  noData: {
    textAlign: "center",
    marginTop: "15px",
    color: "#777",
  },
};

export default ManageUsers;