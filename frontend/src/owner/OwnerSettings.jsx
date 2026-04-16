import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const OwnerSettings = () => {
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [storeName, setStoreName] = useState("My E-Commerce");
  const [storeEmail, setStoreEmail] = useState("support@myecommerce.com");
  const [storePhone, setStorePhone] = useState("+91 9876543210");
  const [storeAddress, setStoreAddress] = useState("Hyderabad, Telangana, India");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [orderAutoConfirm, setOrderAutoConfirm] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("owner123");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const showMessage = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), 2500);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      const data = res.data || {};

      setStoreName(data.store_name ?? "My E-Commerce");
      setStoreEmail(data.store_email ?? "support@myecommerce.com");
      setStorePhone(data.store_phone ?? "+91 9876543210");
      setStoreAddress(data.store_address ?? "Hyderabad, Telangana, India");
      setCurrency(data.currency ?? "INR");
      setTimezone(data.timezone ?? "Asia/Kolkata");
      setOrderAutoConfirm(data.order_auto_confirm ?? true);
      setMaintenanceMode(data.maintenance_mode ?? false);
      setEmailNotifications(data.email_notifications ?? true);
      setSmsNotifications(data.sms_notifications ?? false);
      setLowStockAlerts(data.low_stock_alerts ?? true);
      setTwoFactor(data.two_factor ?? false);
      setLogoPreview(data.logo_preview ?? "");
      setBannerPreview(data.banner_preview ?? "");
    } catch (error) {
      console.error(error);
      showMessage("Failed to load settings");
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/settings`, {
        store_name: storeName,
        store_email: storeEmail,
        store_phone: storePhone,
        store_address: storeAddress,
        currency,
        timezone,
        order_auto_confirm: orderAutoConfirm,
        maintenance_mode: maintenanceMode,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        low_stock_alerts: lowStockAlerts,
        two_factor: twoFactor,
        logo_preview: logoPreview,
        banner_preview: bannerPreview,
      });

      showMessage("Settings saved successfully");
    } catch (error) {
      console.error(error);
      showMessage("Failed to save settings");
    }
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || "";

      if (type === "logo") {
        setLogoPreview(result);
      } else {
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = () => {
    const current = prompt("Enter current password");
    if (current === null) return;

    if (current !== ownerPassword) {
      showMessage("Current password is incorrect");
      return;
    }

    const nextPassword = prompt("Enter new password");
    if (nextPassword === null) return;

    if (!nextPassword.trim()) {
      showMessage("New password cannot be empty");
      return;
    }

    const confirmPassword = prompt("Confirm new password");
    if (confirmPassword === null) return;

    if (nextPassword !== confirmPassword) {
      showMessage("Passwords do not match");
      return;
    }

    setOwnerPassword(nextPassword);
    showMessage("Password changed successfully");
  };

  return (
    <div style={{ padding: "10px" }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Store Settings</h1>
          <p style={styles.subtitle}>
            Manage your store identity, platform preferences, and security
          </p>
        </div>

        <button onClick={handleSave} style={styles.saveBtn}>
          Save Changes
        </button>
      </div>

      {statusMessage && <div style={styles.statusBox}>{statusMessage}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏪 Store Information</h3>

          <div style={styles.field}>
            <label style={styles.label}>Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Store Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Store Phone</label>
            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Store Address</label>
            <textarea
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              style={styles.textarea}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎨 Branding</h3>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e, "logo")}
          />

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e, "banner")}
          />

          <div style={styles.uploadBox}>
            <div style={styles.logoPreview}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={styles.previewImage} />
              ) : (
                "LOGO"
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              style={styles.secondaryBtn}
            >
              Upload Logo
            </button>
          </div>

          <div style={styles.uploadBox}>
            <div style={styles.bannerPreview}>
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner" style={styles.previewImage} />
              ) : (
                "Homepage Banner"
              )}
            </div>
            <button
              onClick={() => bannerInputRef.current?.click()}
              style={styles.secondaryBtn}
            >
              Upload Banner
            </button>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Primary Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.select}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={styles.select}
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛒 Platform Controls</h3>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>Auto Confirm Orders</p>
              <p style={styles.toggleSub}>Automatically confirm new orders</p>
            </div>
            <input
              type="checkbox"
              checked={orderAutoConfirm}
              onChange={() => setOrderAutoConfirm(!orderAutoConfirm)}
            />
          </div>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>Maintenance Mode</p>
              <p style={styles.toggleSub}>Temporarily disable customer access</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔔 Notifications</h3>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>Email Notifications</p>
              <p style={styles.toggleSub}>Receive updates on email</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
            />
          </div>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>SMS Notifications</p>
              <p style={styles.toggleSub}>Receive urgent SMS alerts</p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={() => setSmsNotifications(!smsNotifications)}
            />
          </div>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>Low Stock Alerts</p>
              <p style={styles.toggleSub}>Get alerts for low inventory</p>
            </div>
            <input
              type="checkbox"
              checked={lowStockAlerts}
              onChange={() => setLowStockAlerts(!lowStockAlerts)}
            />
          </div>
        </div>
      </div>

      <div style={styles.gridSingle}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔐 Security</h3>

          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleTitle}>Two-Factor Authentication</p>
              <p style={styles.toggleSub}>
                Add an extra layer of owner account security
              </p>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={() => setTwoFactor(!twoFactor)}
            />
          </div>

          <div style={styles.securityActions}>
            <button onClick={handleChangePassword} style={styles.secondaryBtn}>
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#64748b",
    fontSize: "15px",
  },
  saveBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statusBox: {
    marginBottom: "20px",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  gridSingle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  cardTitle: {
    margin: "0 0 18px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    boxSizing: "border-box",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    boxSizing: "border-box",
  },
  uploadBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "16px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  logoPreview: {
    width: "80px",
    height: "80px",
    borderRadius: "14px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#475569",
    overflow: "hidden",
  },
  bannerPreview: {
    width: "120px",
    height: "70px",
    borderRadius: "14px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    padding: "6px",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  secondaryBtn: {
    background: "#f1f5f9",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "16px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  toggleTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },
  toggleSub: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  securityActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "18px",
  },
};

export default OwnerSettings;