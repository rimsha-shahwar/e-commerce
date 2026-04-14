import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const OwnerAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [ordersRes, usersRes, adminsRes, productsRes] = await Promise.all([
        axios.get("http://localhost:8000/orders"),
        axios.get("http://localhost:8000/users"),
        axios.get("http://localhost:8000/admins"),
        axios.get("http://localhost:8000/products"),
      ]);

      const formattedOrders = (ordersRes.data || []).map((order) => ({
        ...order,
        products:
          typeof order.products === "string"
            ? JSON.parse(order.products)
            : order.products || [],
      }));

      setOrders(formattedOrders);
      setUsers(usersRes.data || []);
      setAdmins(adminsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const pendingOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;

    const processingOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "processing"
    ).length;

    const shippedOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "shipped"
    ).length;

    const deliveredOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "cancelled"
    ).length;

    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const paymentMap = {};
    orders.forEach((order) => {
      const key = (order.payment_mode || "unknown").toUpperCase();
      paymentMap[key] = (paymentMap[key] || 0) + 1;
    });

    const paymentStats = Object.entries(paymentMap).map(([name, count]) => ({
      name,
      count,
    }));

    const productMap = {};
    orders.forEach((order) => {
      (order.products || []).forEach((product) => {
        const key = product.name || "Product";

        if (!productMap[key]) {
          productMap[key] = {
            name: key,
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[key].quantity += Number(product.quantity || 0);
        productMap[key].revenue +=
          Number(product.price || 0) * Number(product.quantity || 0);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const monthlyEstimate = [
      {
        label: "Week 1",
        value: Math.round(totalRevenue * 0.18),
      },
      {
        label: "Week 2",
        value: Math.round(totalRevenue * 0.22),
      },
      {
        label: "Week 3",
        value: Math.round(totalRevenue * 0.27),
      },
      {
        label: "Week 4",
        value: Math.round(totalRevenue * 0.33),
      },
    ];

    const maxRevenueBar = Math.max(
      ...monthlyEstimate.map((item) => item.value),
      1
    );

    const totalUsers = users.length;
    const activeUsers = users.filter(
      (u) => u.is_active === true || u.is_active === 1
    ).length;
    const blockedUsers = totalUsers - activeUsers;

    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(
      (a) => a.is_active === true || a.is_active === 1
    ).length;
    const inactiveAdmins = totalAdmins - activeAdmins;

    const totalProducts = products.length;
    const inStockProducts = products.filter((p) => Number(p.stock || 0) > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;

    const entityBars = [
      { label: "Users", value: totalUsers, color: "#2563eb" },
      { label: "Admins", value: totalAdmins, color: "#7c3aed" },
      { label: "Products", value: totalProducts, color: "#16a34a" },
      { label: "Orders", value: totalOrders, color: "#ea580c" },
    ];

    const maxEntityBar = Math.max(...entityBars.map((item) => item.value), 1);

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue,
      paymentStats,
      topProducts,
      monthlyEstimate,
      maxRevenueBar,
      totalUsers,
      activeUsers,
      blockedUsers,
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      entityBars,
      maxEntityBar,
    };
  }, [orders, users, admins, products]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const statusCards = [
    {
      title: "Pending",
      value: analytics.pendingOrders,
      bg: "#fff7ed",
      color: "#c2410c",
    },
    {
      title: "Processing",
      value: analytics.processingOrders,
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
    {
      title: "Shipped",
      value: analytics.shippedOrders,
      bg: "#eff6ff",
      color: "#2563eb",
    },
    {
      title: "Delivered",
      value: analytics.deliveredOrders,
      bg: "#f0fdf4",
      color: "#16a34a",
    },
    {
      title: "Cancelled",
      value: analytics.cancelledOrders,
      bg: "#fef2f2",
      color: "#dc2626",
    },
  ];

  return (
    <div style={{ padding: "10px" }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📈 Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Monitor revenue, orders, users, admins, and product performance
          </p>
        </div>

        <button onClick={fetchAnalyticsData} style={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>Loading analytics...</div>
      ) : (
        <>
          <div style={styles.topCards}>
            <div style={styles.mainCard}>
              <p style={styles.cardLabel}>Total Revenue</p>
              <h2 style={{ ...styles.bigValue, color: "#2563eb" }}>
                {formatCurrency(analytics.totalRevenue)}
              </h2>
              <p style={styles.smallText}>
                From {analytics.totalOrders} total orders
              </p>
            </div>

            <div style={styles.mainCard}>
              <p style={styles.cardLabel}>Average Order Value</p>
              <h2 style={{ ...styles.bigValue, color: "#111827" }}>
                {formatCurrency(analytics.averageOrderValue)}
              </h2>
              <p style={styles.smallText}>Average spend per order</p>
            </div>

            <div style={styles.mainCard}>
              <p style={styles.cardLabel}>Delivered Orders</p>
              <h2 style={{ ...styles.bigValue, color: "#16a34a" }}>
                {analytics.deliveredOrders}
              </h2>
              <p style={styles.smallText}>Successfully completed deliveries</p>
            </div>

            <div style={styles.mainCard}>
              <p style={styles.cardLabel}>Total Orders</p>
              <h2 style={{ ...styles.bigValue, color: "#7c3aed" }}>
                {analytics.totalOrders}
              </h2>
              <p style={styles.smallText}>All orders placed on platform</p>
            </div>
          </div>

          <div style={styles.miniCards}>
            <div style={styles.miniCard}>
              <p style={styles.miniTitle}>Users</p>
              <h3 style={{ ...styles.miniValue, color: "#2563eb" }}>
                {analytics.totalUsers}
              </h3>
              <p style={styles.miniSub}>
                Active: {analytics.activeUsers} | Blocked: {analytics.blockedUsers}
              </p>
            </div>

            <div style={styles.miniCard}>
              <p style={styles.miniTitle}>Admins</p>
              <h3 style={{ ...styles.miniValue, color: "#7c3aed" }}>
                {analytics.totalAdmins}
              </h3>
              <p style={styles.miniSub}>
                Active: {analytics.activeAdmins} | Inactive: {analytics.inactiveAdmins}
              </p>
            </div>

            <div style={styles.miniCard}>
              <p style={styles.miniTitle}>Products</p>
              <h3 style={{ ...styles.miniValue, color: "#16a34a" }}>
                {analytics.totalProducts}
              </h3>
              <p style={styles.miniSub}>
                In Stock: {analytics.inStockProducts} | Out: {analytics.outOfStockProducts}
              </p>
            </div>
          </div>

          <div style={styles.sectionGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Revenue Trend</h3>
                <span style={styles.panelTag}>Monthly Snapshot</span>
              </div>

              <div style={styles.chartWrap}>
                {analytics.monthlyEstimate.map((item, index) => (
                  <div key={index} style={styles.barItem}>
                    <div style={styles.barOuter}>
                      <div
                        style={{
                          ...styles.barInner,
                          height: `${
                            (item.value / analytics.maxRevenueBar) * 180
                          }px`,
                        }}
                      />
                    </div>
                    <p style={styles.barLabel}>{item.label}</p>
                    <p style={styles.barValue}>{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Order Status Overview</h3>
                <span style={styles.panelTag}>Live Summary</span>
              </div>

              <div style={styles.statusGrid}>
                {statusCards.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.statusCard,
                      background: item.bg,
                    }}
                  >
                    <p style={{ ...styles.statusTitle, color: item.color }}>
                      {item.title}
                    </p>
                    <h3 style={{ ...styles.statusValue, color: item.color }}>
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.sectionGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Platform Growth</h3>
                <span style={styles.panelTag}>Users / Admins / Products / Orders</span>
              </div>

              <div style={styles.growthWrap}>
                {analytics.entityBars.map((item, index) => (
                  <div key={index} style={styles.growthItem}>
                    <div style={styles.growthTextRow}>
                      <span style={styles.growthLabel}>{item.label}</span>
                      <span style={styles.growthValue}>{item.value}</span>
                    </div>
                    <div style={styles.growthTrack}>
                      <div
                        style={{
                          ...styles.growthFill,
                          width: `${(item.value / analytics.maxEntityBar) * 100}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Payment Insights</h3>
                <span style={styles.panelTag}>Methods Used</span>
              </div>

              {analytics.paymentStats.length === 0 ? (
                <div style={styles.emptyState}>No payment data available</div>
              ) : (
                <div style={styles.listWrap}>
                  {analytics.paymentStats.map((item, index) => (
                    <div key={index} style={styles.listRow}>
                      <div>
                        <p style={styles.listTitle}>{item.name}</p>
                        <p style={styles.listSub}>Orders using this method</p>
                      </div>
                      <span style={styles.listValue}>{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.sectionGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Top Selling Products</h3>
                <span style={styles.panelTag}>Best Performers</span>
              </div>

              {analytics.topProducts.length === 0 ? (
                <div style={styles.emptyState}>No product sales available</div>
              ) : (
                <div style={styles.listWrap}>
                  {analytics.topProducts.map((item, index) => (
                    <div key={index} style={styles.listRow}>
                      <div>
                        <p style={styles.listTitle}>{item.name}</p>
                        <p style={styles.listSub}>
                          Qty Sold: {item.quantity}
                        </p>
                      </div>
                      <span style={styles.listValue}>
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Store Snapshot</h3>
                <span style={styles.panelTag}>Quick Overview</span>
              </div>

              <div style={styles.snapshotGrid}>
                <div style={styles.snapshotCard}>
                  <p style={styles.snapshotTitle}>Active Users</p>
                  <h3 style={{ ...styles.snapshotValue, color: "#2563eb" }}>
                    {analytics.activeUsers}
                  </h3>
                </div>

                <div style={styles.snapshotCard}>
                  <p style={styles.snapshotTitle}>Active Admins</p>
                  <h3 style={{ ...styles.snapshotValue, color: "#7c3aed" }}>
                    {analytics.activeAdmins}
                  </h3>
                </div>

                <div style={styles.snapshotCard}>
                  <p style={styles.snapshotTitle}>In Stock Products</p>
                  <h3 style={{ ...styles.snapshotValue, color: "#16a34a" }}>
                    {analytics.inStockProducts}
                  </h3>
                </div>

                <div style={styles.snapshotCard}>
                  <p style={styles.snapshotTitle}>Out of Stock</p>
                  <h3 style={{ ...styles.snapshotValue, color: "#dc2626" }}>
                    {analytics.outOfStockProducts}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.bottomPanel}>
            <div style={styles.bottomBox}>
              <h3 style={styles.bottomTitle}>Business Health</h3>
              <p style={styles.bottomText}>
                Your store currently has{" "}
                <strong>{analytics.totalOrders}</strong> orders and a total
                generated revenue of{" "}
                <strong>{formatCurrency(analytics.totalRevenue)}</strong>.
              </p>
            </div>

            <div style={styles.bottomBox}>
              <h3 style={styles.bottomTitle}>User & Admin Strength</h3>
              <p style={styles.bottomText}>
                Platform has <strong>{analytics.totalUsers}</strong> users and{" "}
                <strong>{analytics.totalAdmins}</strong> admins managing the system.
              </p>
            </div>

            <div style={styles.bottomBox}>
              <h3 style={styles.bottomTitle}>Growth Signal</h3>
              <p style={styles.bottomText}>
                Your average order value is{" "}
                <strong>{formatCurrency(analytics.averageOrderValue)}</strong>,
                with <strong>{analytics.totalProducts}</strong> products in catalog.
              </p>
            </div>
          </div>
        </>
      )}
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
  loadingBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "16px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  topCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },
  mainCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  cardLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600",
  },
  bigValue: {
    margin: "10px 0 6px 0",
    fontSize: "30px",
    fontWeight: "800",
  },
  smallText: {
    margin: 0,
    fontSize: "13px",
    color: "#94a3b8",
  },
  miniCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  miniCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  miniTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },
  miniValue: {
    margin: "8px 0 6px 0",
    fontSize: "26px",
    fontWeight: "800",
  },
  miniSub: {
    margin: 0,
    fontSize: "13px",
    color: "#94a3b8",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  panel: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "10px",
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  panelTag: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563eb",
    background: "#eff6ff",
    padding: "8px 12px",
    borderRadius: "999px",
  },
  chartWrap: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "14px",
    minHeight: "250px",
    paddingTop: "10px",
  },
  barItem: {
    flex: 1,
    textAlign: "center",
  },
  barOuter: {
    height: "190px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  barInner: {
    width: "55px",
    background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
    borderRadius: "14px 14px 6px 6px",
    transition: "0.3s",
  },
  barLabel: {
    margin: "10px 0 4px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  barValue: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px",
  },
  statusCard: {
    borderRadius: "16px",
    padding: "18px",
  },
  statusTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
  },
  statusValue: {
    margin: "10px 0 0 0",
    fontSize: "28px",
    fontWeight: "800",
  },
  growthWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  growthItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  growthTextRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  growthLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  },
  growthValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
  },
  growthTrack: {
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  growthFill: {
    height: "100%",
    borderRadius: "999px",
  },
  listWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
    gap: "12px",
  },
  listTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },
  listSub: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  listValue: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#2563eb",
  },
  emptyState: {
    padding: "30px 0",
    color: "#64748b",
    textAlign: "center",
  },
  snapshotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
  },
  snapshotCard: {
    background: "#f8fafc",
    borderRadius: "14px",
    padding: "16px",
    border: "1px solid #e5e7eb",
  },
  snapshotTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },
  snapshotValue: {
    margin: "8px 0 0 0",
    fontSize: "24px",
    fontWeight: "800",
  },
  bottomPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },
  bottomBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  bottomTitle: {
    margin: "0 0 10px 0",
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
  },
  bottomText: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.7",
  },
};

export default OwnerAnalytics;