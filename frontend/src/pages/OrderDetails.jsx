import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "pending") return 0;
    if (normalized === "processing") return 1;
    if (normalized === "shipped") return 2;
    if (normalized === "delivered") return 3;
    if (normalized === "cancelled") return -1;

    return 0;
  };

  const getStatusColor = (status) => {
    if (status === "Delivered") return "text-green-600";
    if (status === "Shipped") return "text-blue-600";
    if (status === "Processing") return "text-purple-600";
    if (status === "Cancelled") return "text-red-600";
    return "text-orange-500";
  };

  const getPaymentText = (paymentMode, paymentStatus) => {
    const mode = (paymentMode || "").toLowerCase();
    const status = (paymentStatus || "").toLowerCase();

    if (mode === "cod") return "💰 Cash on Delivery";
    if (status === "paid") return "✅ Paid";
    return "⏳ Payment Pending";
  };

  const getPaymentColor = (paymentMode, paymentStatus) => {
    const mode = (paymentMode || "").toLowerCase();
    const status = (paymentStatus || "").toLowerCase();

    if (mode === "cod") return "text-yellow-600";
    if (status === "paid") return "text-green-600";
    return "text-red-500";
  };

  const sendInvoiceToEmail = async () => {
    try {
      setSending(true);

      const res = await axios.post(
        `${API_BASE_URL}/orders/${order.id}/send-invoice`
      );

      alert(res.data.message || "Invoice sent successfully");
    } catch (err) {
      alert(err?.response?.data?.detail || "Mail is incorrect");
    } finally {
      setSending(false);
    }
  };

  const steps = ["Order Placed", "Processing", "Shipped", "Delivered"];
  const currentStep = getStepIndex(order?.status);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!order) return <p className="p-6">Order not found</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Details</h2>

        <div className="flex gap-3">
          <button
            onClick={sendInvoiceToEmail}
            disabled={sending}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {sending ? "Sending..." : "Send Invoice"}
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-5 border mb-6">
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>

        <p>
          <strong>User ID:</strong> {order.user_id}
        </p>

        <p>
          <strong>Payment Mode:</strong> {order.payment_mode}
        </p>

        <p className="mt-1">
          <strong>Payment Status:</strong>{" "}
          <span className={getPaymentColor(order.payment_mode, order.payment_status)}>
            {getPaymentText(order.payment_mode, order.payment_status)}
          </span>
        </p>

        {order.razorpay_payment_id && (
          <p>
            <strong>Payment ID:</strong> {order.razorpay_payment_id}
          </p>
        )}

        {order.razorpay_order_id && (
          <p>
            <strong>Razorpay Order ID:</strong> {order.razorpay_order_id}
          </p>
        )}

        <p>
          <strong>Total Amount:</strong> ₹{order.total_amount}
        </p>

        <p className="mt-2">
          <strong>Status:</strong>{" "}
          <span className={getStatusColor(order.status)}>
            {order.status}
          </span>
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-5 border mb-6">
        <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>

        {order.status?.toLowerCase() === "cancelled" ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            This order has been cancelled.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 flex items-center min-w-[120px]">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index <= currentStep ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <p
                    className={`mt-2 text-sm font-medium text-center ${
                      index <= currentStep ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </p>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`h-1 w-full mx-2 rounded ${
                      index < currentStep ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-5 border">
        <h3 className="text-lg font-semibold mb-3">Products</h3>

        <div className="space-y-4">
          {order.products?.map((p, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border p-3 rounded"
            >
              <img
                src={p.image || "https://placehold.co/80x80"}
                alt={p.name || "Product"}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => {
                  e.target.src = "https://placehold.co/80x80";
                }}
              />

              <div>
                <p className="font-semibold">{p.name}</p>
                <p>Price: ₹{p.price}</p>
                <p>Quantity: {p.quantity}</p>
                <p>Total: ₹{p.price * p.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;