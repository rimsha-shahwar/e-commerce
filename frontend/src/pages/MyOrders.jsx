import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user || !user.id) {
        console.error("User not found in localStorage");
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/orders/user/${user.id}`
      );

      const formattedOrders = (res.data || []).map((order) => {
        let parsedProducts = [];

        if (Array.isArray(order.products)) {
          parsedProducts = order.products;
        } else if (typeof order.products === "string") {
          try {
            parsedProducts = JSON.parse(order.products);
          } catch (err) {
            console.error("Invalid products JSON:", err);
            parsedProducts = [];
          }
        }

        return {
          ...order,
          products: parsedProducts,
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error(error);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/cancel/${id}`);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "#f59e0b";
    if (status === "Shipped") return "#3b82f6";
    if (status === "Delivered") return "#10b981";
    if (status === "Cancelled") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div style={{ padding: "30px", background: "#f4f6f8", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>🧾 My Orders</h2>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 14px",
            background: "#e5e7eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ⬅ Back
        </button>
      </div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Order #{order.id}</h3>

              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background: getStatusColor(order.status),
                  color: "white",
                  fontSize: "12px",
                }}
              >
                {order.status}
              </span>
            </div>

            <p>
              <strong>Total:</strong> ₹{order.total_amount}
            </p>
            <p>
              <strong>Payment:</strong> {order.payment_mode?.toUpperCase()}
            </p>

            <div style={{ marginTop: "15px" }}>
              {order.products?.length > 0 ? (
                order.products.map((p, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                      marginBottom: "10px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                    }}
                  >
                    <img
                      src={p.image || "https://placehold.co/70x70"}
                      alt={p.name || "Product"}
                      width="70"
                      height="70"
                      style={{
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/70x70";
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {p.name || "Product"}
                      </p>
                      <p style={{ margin: 0 }}>₹{p.price}</p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        Qty: {p.quantity}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#666" }}>No product details available</p>
              )}
            </div>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                View Details
              </button>

              {order.status !== "Cancelled" && (
                <button
                  onClick={() => cancelOrder(order.id)}
                  style={{
                    padding: "8px 12px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;