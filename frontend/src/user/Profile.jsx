import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    setForm({
      name: storedUser.name || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
      address: storedUser.address || "",
      profile_image: storedUser.profile_image || ""
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profile_image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user || !user.id) {
      setMessage("❌ Please login again");
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `http://localhost:8000/users/${user.id}`,
        form
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      setMessage("✅ Profile updated successfully");

    } catch (err) {
      setMessage("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>

        {/* LEFT SIDE */}
        <div style={styles.leftCard}>
          <img
            src={form.profile_image || "https://placehold.co/120"}
            alt="profile"
            style={styles.avatar}
          />

          <h2 style={{ marginTop: "10px" }}>{form.name}</h2>
          <p style={{ color: "#666" }}>{form.email}</p>

          <div style={styles.infoBox}>
            <p><strong>📞</strong> {form.phone || "-"}</p>
            <p><strong>🏠</strong> {form.address || "-"}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.rightCard}>

          <h2 style={{ marginBottom: "15px" }}>Edit Profile</h2>

          {message && (
            <div style={styles.message}>{message}</div>
          )}

          <div style={styles.form}>

            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={styles.input} />

            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={styles.input} />

            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={styles.input} />

            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" style={styles.input} />

            <input type="file" onChange={handleImageUpload} />

            <button onClick={updateProfile} disabled={loading} style={styles.button}>
              {loading ? "Updating..." : "Save Changes"}
            </button>

          </div>
        </div>

      </div>
    </>
  );
};

const styles = {
  page: {
    display: "flex",
    gap: "20px",
    padding: "30px",
    background: "#f4f6f9",
    minHeight: "100vh"
  },

  leftCard: {
    width: "300px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  rightCard: {
    flex: 1,
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #ddd"
  },

  infoBox: {
    marginTop: "15px",
    textAlign: "left",
    fontSize: "14px",
    color: "#333"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none"
  },

  button: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  message: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px"
  }
};

export default Profile;