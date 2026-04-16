import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

function ConfirmOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState({
    orderedItems: [],
    payment: "",
    total: 0,
    addressId: null,
    userId: null
  });

  // ✅ Load data from state OR localStorage
  useEffect(() => {
    if (location.state) {
      setOrderData(location.state);

      // save backup
      localStorage.setItem(
        "confirmOrder",
        JSON.stringify(location.state)
      );
    } else {
      const saved = JSON.parse(localStorage.getItem("confirmOrder"));
      if (saved) {
        setOrderData(saved);
      }
    }
  }, []);

  const { orderedItems, payment, total, addressId, userId } = orderData;

  // ❌ If no data
  if (!orderedItems || orderedItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">
          No order data found 😢
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  // ✅ Place Order API
  const placeOrder = async () => {
    try {
      const payload = {
        user_id: userId,
        address_id: addressId,
        payment_mode: payment,
        total_amount: total,
        products: orderedItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await axios.post(
        `${API_BASE_URL}/orders`,
        payload
      );

      if (res.status === 200 || res.status === 201) {
        localStorage.removeItem("confirmOrder"); // cleanup
        navigate("/order-success");
      }
    } catch (err) {
        console.log("FULL ERROR:", err);
        console.log("RESPONSE:", err.response);
        alert("Order failed");
      }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">

      {/* 🔙 Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-white px-3 py-1 rounded shadow"
        >
          ←
        </button>
        <h2 className="text-xl font-bold">Confirm Your Order</h2>
      </div>

      {/* 📦 Items */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-3">Items</h3>

        {orderedItems.map(item => (
          <div
            key={item.id}
            className="flex justify-between border-b py-2"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>

            <p className="font-semibold">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* 💳 Payment */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-green-600 font-medium">
          {payment === "cod" ? "Cash on Delivery" : payment}
        </p>
      </div>

      {/* 📍 Address */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Delivery Address</h3>
        <p className="text-gray-600">
          Address ID: {addressId}
        </p>
      </div>

      {/* 💰 Total */}
      <div className="bg-white p-4 rounded-xl shadow mb-20">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* 🚀 Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <button
          onClick={placeOrder}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600"
        >
          Confirm & Pay ₹{total}
        </button>
      </div>
    </div>
  );
}

export default ConfirmOrder;