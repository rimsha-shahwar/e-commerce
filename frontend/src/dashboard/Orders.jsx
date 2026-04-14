import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [currency, setCurrency] = useState("INR");
  const [orderAutoConfirm, setOrderAutoConfirm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/settings");
      setCurrency(res.data?.currency || "INR");
      setOrderAutoConfirm(res.data?.order_auto_confirm || false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products");

      const map = {};
      res.data.forEach((p) => {
        map[p.id] = p.name;
      });

      setProductsMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/orders");

      const formatted = res.data.map((o) => ({
        id: o.id,
        customerName: o.customerName || `User #${o.user_id ?? ""}`,
        totalAmount: o.total_amount,
        status: (o.status || "Pending").toLowerCase(),
        products:
          typeof o.products === "string"
            ? JSON.parse(o.products)
            : o.products || [],
      }));

      setOrders(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8000/orders/${id}/status?status=${status}`
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: status.toLowerCase() } : o
        )
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const deleteOrder = async () => {
    try {
      await axios.delete(`http://localhost:8000/orders/${deleteId}`);

      setShowModal(false);
      setDeleteId(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  const formatCurrency = (amount) => {
    if (currency === "USD") return `$${Number(amount || 0).toLocaleString()}`;
    if (currency === "AED") return `AED ${Number(amount || 0).toLocaleString()}`;
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-3">📦 Orders</h2>

      <div className="mb-6 bg-blue-50 border rounded-lg p-4 text-sm text-blue-700">
        Auto Confirm Orders:{" "}
        <span className="font-semibold">
          {orderAutoConfirm ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No orders found 😢
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{o.id}</td>

                  <td className="p-3 font-medium">{o.customerName}</td>

                  <td className="p-3">
                    {o.products.map((p, i) => (
                      <div key={i} className="text-sm">
                        🛒 {productsMap[p.product_id] || p.name || "Unknown"} ×{" "}
                        {p.quantity}
                      </div>
                    ))}
                  </td>

                  <td className="p-3 font-bold text-green-600">
                    {formatCurrency(o.totalAmount || 0)}
                  </td>

                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => openDeleteModal(o.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this order?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={deleteOrder}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Orders;