import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Address() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    orderedItems = [],
    payment = "",
    total = 0,
    order_id = null,
    payment_status = null,
  } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user")) || null;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    try {
      if (!user?.id) {
        alert("Please login first");
        return;
      }

      const addressRes = await axios.post("http://localhost:8000/addresses", {
        user_id: user.id,
        name: form.name,
        phone: form.phone,
        address_line: form.address_line,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      const addressId = addressRes.data.id;

      // if online order already created
      if (order_id) {
        await axios.put(`http://localhost:8000/orders/${order_id}/address?address_id=${addressId}`);
        navigate("/order-success", {
          state: {
            order_id,
            payment,
            payment_status,
          },
        });
        return;
      }

      // COD flow: create order now
      const productsPayload = orderedItems.map((item) => ({
        product_id: item.id || item.product_id,
        quantity: item.quantity,
      }));

      const codRes = await axios.post("http://localhost:8000/orders/cod", {
        user_id: user.id,
        address_id: addressId,
        payment_mode: payment,
        total_amount: total,
        products: productsPayload,
      });

      navigate("/order-success", {
        state: {
          order_id: codRes.data.order_id,
          payment,
          payment_status: "COD",
        },
      });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to save address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-5 text-center">Add Address</h2>

        <div className="grid gap-3">
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="border p-3 rounded-xl" />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-3 rounded-xl" />
          <input name="address_line" placeholder="Address Line" value={form.address_line} onChange={handleChange} className="border p-3 rounded-xl" />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border p-3 rounded-xl" />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="border p-3 rounded-xl" />
          <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="border p-3 rounded-xl" />
        </div>

        <button
          onClick={handleSaveAddress}
          className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
        >
          Save Address & Continue
        </button>
      </div>
    </div>
  );
}

export default Address;