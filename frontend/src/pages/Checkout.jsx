import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PaymentOptions from "../components/checkout/PaymentOptions";
import API_BASE_URL from "../config";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderedItems = location.state?.orderedItems || [];
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const [payment, setPayment] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [storeName, setStoreName] = useState("My Store");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      setCurrency(res.data?.currency || "INR");
      setSupportEmail(res.data?.store_email || "");
      setSupportPhone(res.data?.store_phone || "");
      setStoreName(res.data?.store_name || "My Store");
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const formatCurrency = (amount) => {
    if (currency === "USD") return `$${Number(amount || 0).toLocaleString()}`;
    if (currency === "AED") return `AED ${Number(amount || 0).toLocaleString()}`;
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const total = orderedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const prepareProductsPayload = () => {
    return orderedItems.map((item) => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity,
    }));
  };

  const handleBack = () => {
    navigate("/cart");
  };

  const handleCashOnDelivery = () => {
    navigate("/address", {
      state: {
        orderedItems,
        payment,
        total,
      },
    });
  };

  const openRazorpayCheckout = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        alert("Please login first");
        return;
      }

      if (!orderedItems.length) {
        alert("No items selected");
        return;
      }

      if (total <= 0) {
        alert("Invalid order amount");
        return;
      }

      const productsPayload = prepareProductsPayload();

      const orderRes = await axios.post(`${API_BASE_URL}/payments/create-order`, {
        user_id: user.id,
        amount: total,
        currency: "INR",
        payment_mode: payment,
        products: productsPayload,
      });

      const {
        order_db_id,
        razorpay_order_id,
        amount,
        currency,
        key,
      } = orderRes.data;

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check index.html script.");
        return;
      }

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: storeName,
        description: "Order Payment",
        order_id: razorpay_order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || supportEmail || "",
          contact: user?.phone || supportPhone || "",
        },
        notes: {
          local_order_id: String(order_db_id),
        },
        theme: {
          color: "#22c55e",
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE_URL}/payments/verify`, {
              order_db_id: order_db_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.payment_status === "Paid") {
              navigate("/order-success", {
                state: {
                  order_id: verifyRes.data.order_id,
                  payment,
                  payment_status: "Paid",
                  total,
                  orderedItems,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                },
              });
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.error("VERIFY ERROR:", err);
            alert(err?.response?.data?.detail || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed by user");
            alert("Payment popup closed before completing payment");
          },
          escape: true,
          backdropclose: false,
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED:", response);
        alert(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed"
        );
      });

      razorpay.open();
    } catch (err) {
      console.error("PAYMENT START FAILED:", err);
      alert(err?.response?.data?.detail || "Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!payment) {
      alert("Please select payment method");
      return;
    }

    if (payment === "upi" || payment === "card") {
      await openRazorpayCheckout();
      return;
    }

    if (payment === "cod") {
      handleCashOnDelivery();
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">🧾 Checkout</h2>

        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Order Summary</h3>

          {orderedItems.length === 0 ? (
            <p className="text-sm text-gray-500">No items selected.</p>
          ) : (
            orderedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm mb-1"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))
          )}

          <hr className="my-2" />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Payment Method</h3>
          <PaymentOptions payment={payment} setPayment={setPayment} />
        </div>

        <div className="mb-6 bg-blue-50 border rounded-lg p-4 text-sm text-gray-700">
          <p>
            <strong>Support Email:</strong> {supportEmail || "Not set"}
          </p>
          <p>
            <strong>Support Phone:</strong> {supportPhone || "Not set"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-1/2 py-3 rounded-xl bg-gray-400 text-white font-semibold hover:bg-gray-500"
          >
            ← Back to Cart
          </button>

          <button
            type="button"
            disabled={!payment || loading}
            onClick={handleNext}
            className={`w-1/2 py-3 rounded-xl text-white font-semibold transition ${
              payment
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;