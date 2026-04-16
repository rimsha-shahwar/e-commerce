import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders`);

      const formatted = (res.data || []).map((order) => ({
        ...order,
        products:
          typeof order.products === "string"
            ? JSON.parse(order.products)
            : order.products || [],
      }));

      setOrders(formatted);
    } catch (err) {
      console.error("Error fetching owner orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearch("");
    setStatusFilter("all");
    await fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        (order.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch =
        String(order.id).includes(search) ||
        String(order.user_id || "").includes(search) ||
        (order.payment_mode || "").toLowerCase().includes(search.toLowerCase()) ||
        (order.products || []).some((p) =>
          (p.name || "").toLowerCase().includes(search.toLowerCase())
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
    const deliveredOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "delivered"
    ).length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );

    return { totalOrders, pendingOrders, deliveredOrders, totalRevenue };
  }, [orders]);

  const getStatusStyle = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "pending") {
      return {
        background: "#fef3c7",
        color: "#b45309",
      };
    }

    if (value === "processing") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (value === "shipped") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (value === "delivered") {
      return {
        background: "#dcfce7",
        color: "#15803d",
      };
    }

    if (value === "cancelled") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div style={{ padding: "10px" }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Orders Management</h1>
          <p style={styles.subtitle}>
            Track all customer orders, revenue, and fulfillment progress
          </p>
        </div>

        <button onClick={handleRefresh} style={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Orders</p>
          <h2 style={styles.cardValue}>{stats.totalOrders}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Orders</p>
          <h2 style={{ ...styles.cardValue, color: "#d97706" }}>
            {stats.pendingOrders}
          </h2>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Delivered Orders</p>
          <h2 style={{ ...styles.cardValue, color: "#16a34a" }}>
            {stats.deliveredOrders}
          </h2>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Revenue</p>
          <h2 style={{ ...styles.cardValue, color: "#2563eb" }}>
            {formatCurrency(stats.totalRevenue)}
          </h2>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by order id, user id, payment, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {search && (
            <span
              onClick={() => setSearch("")}
              style={styles.clearIcon}
              title="Clear"
            >
              ✕
            </span>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.emptyBox}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyBox}>No orders found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Products</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "700", color: "#111827" }}>
                      Order #{order.id}
                    </div>
                    <div style={styles.mutedText}>User #{order.user_id}</div>
                    <div style={styles.mutedText}>
                      Items: {order.products?.length || 0}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.productList}>
                      {(order.products || []).slice(0, 3).map((p, index) => (
                        <div key={index} style={styles.productItem}>
                          <img
                            src={p.image || "https://placehold.co/50x50"}
                            alt={p.name || "Product"}
                            style={styles.productImg}
                            onError={(e) => {
                              e.target.src = "https://placehold.co/50x50";
                            }}
                          />
                          <div>
                            <div style={styles.productName}>
                              {p.name || "Product"}
                            </div>
                            <div style={styles.mutedText}>
                              Qty: {p.quantity}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(order.products || []).length > 3 && (
                        <div style={styles.moreText}>
                          +{order.products.length - 3} more items
                        </div>
                      )}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.paymentTag}>
                      {(order.payment_mode || "N/A").toUpperCase()}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.totalText}>
                      {formatCurrency(order.total_amount)}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(order.status),
                      }}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  refreshBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },
  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },
  cardValue: {
    margin: "10px 0 0 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
  },
  toolbar: {
    display: "flex",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "280px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  },
  clearIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "16px",
    color: "#6b7280",
    fontWeight: "bold",
  },
  select: {
    minWidth: "180px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#f8fafc",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px",
    verticalAlign: "top",
    fontSize: "14px",
    color: "#111827",
  },
  mutedText: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  productItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  productImg: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  productName: {
    fontWeight: "600",
    color: "#111827",
  },
  moreText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "13px",
  },
  paymentTag: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
  },
  totalText: {
    fontWeight: "800",
    fontSize: "16px",
    color: "#16a34a",
  },
  statusBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    display: "inline-block",
  },
  emptyBox: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "16px",
  },
};

export default OwnerOrders;