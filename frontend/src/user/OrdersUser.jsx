import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrdersUser = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/orders/user/${user.id}`
      );

      setOrders(
        res.data.map((o) => ({
          ...o,
          products:
            typeof o.products === "string"
              ? JSON.parse(o.products)
              : o.products || [],
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Order Status UI
  const getStatusUI = (status) => {
    switch (status) {
      case "Pending":
        return "🟡 Order Placed";
      case "Processing":
        return "⚙ Processing";
      case "Shipped":
        return "🚚 On the way";
      case "Delivered":
        return "✅ Delivered";
      case "Cancelled":
        return "❌ Cancelled";
      default:
        return status;
    }
  };

  // ✅ Payment Status UI
  const getPaymentUI = (mode, status) => {
    if (mode === "cod") return "💰 Cash on Delivery";
    if (status === "Paid") return "✅ Paid";
    return "⏳ Pending";
  };

  const getPaymentColor = (mode, status) => {
    if (mode === "cod") return "orange";
    if (status === "Paid") return "green";
    return "red";
  };

  // ✅ Simple Invoice Generator
  const downloadInvoice = (order) => {
    const content = `
      INVOICE
      ----------------------------
      Order ID: ${order.id}
      Payment Mode: ${order.payment_mode}
      Payment Status: ${order.payment_status}
      Total Amount: ₹${order.total_amount}

      Products:
      ${order.products
        .map((p) => `${p.name} x ${p.quantity}`)
        .join("\n")}

      ----------------------------
      Thank you for shopping!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_order_${order.id}.txt`;
    link.click();
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "15px",
          padding: "6px 12px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button>

      <h2 style={{ marginBottom: "20px" }}>Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((o) => (
          <div
            key={o.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Order ID: {o.id}</h3>

            {/* Order Status */}
            <p>
              <strong>Status:</strong> {getStatusUI(o.status)}
            </p>

            {/* Payment Status */}
            <p style={{ color: getPaymentColor(o.payment_mode, o.payment_status) }}>
              <strong>Payment:</strong>{" "}
              {getPaymentUI(o.payment_mode, o.payment_status)}
            </p>

            {/* Total */}
            <p>
              <strong>Total:</strong> ₹{o.total_amount}
            </p>

            {/* Razorpay Details */}
            {o.razorpay_payment_id && (
              <p>
                <strong>Payment ID:</strong> {o.razorpay_payment_id}
              </p>
            )}

            {o.razorpay_order_id && (
              <p>
                <strong>Razorpay Order ID:</strong> {o.razorpay_order_id}
              </p>
            )}

            {/* Products */}
            <p>
              <strong>Products:</strong>
            </p>

            <ul>
              {o.products.map((p, i) => (
                <li key={i}>
                  {p.name} × {p.quantity}
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => navigate(`/orders/${o.id}`)}
                style={{
                  padding: "6px 10px",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                View Details
              </button>

              <button
                onClick={() => downloadInvoice(o)}
                style={{
                  padding: "6px 10px",
                  background: "green",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Download Invoice
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersUser;