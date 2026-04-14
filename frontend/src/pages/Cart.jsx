import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchCart = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`http://localhost:8000/cart/${user.id}`);
      setCart(res.data || []);
      localStorage.setItem("cart", JSON.stringify(res.data || []));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const selectedProducts = cart.filter((p) => selectedItems.includes(p.id));

  const totalAmount = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const increaseQty = async (id) => {
    const item = cart.find((p) => p.id === id);

    try {
      await axios.put("http://localhost:8000/cart/update", {
        user_id: user.id,
        product_id: id,
        quantity: item.quantity + 1,
      });

      const updatedCart = cart.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      );

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Increase quantity error:", err.response?.data || err.message);
    }
  };

  const decreaseQty = async (id) => {
    const item = cart.find((p) => p.id === id);

    if (item.quantity > 1) {
      try {
        await axios.put("http://localhost:8000/cart/update", {
          user_id: user.id,
          product_id: id,
          quantity: item.quantity - 1,
        });

        const updatedCart = cart.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity - 1 } : p
        );

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Decrease quantity error:", err.response?.data || err.message);
      }
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete("http://localhost:8000/cart/remove", {
        data: {
          user_id: user.id,
          product_id: id,
        },
      });

      const updatedCart = cart.filter((item) => item.id !== id);

      setCart(updatedCart);
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove item error:", err.response?.data || err.message);
    }
  };

  const placeOrder = () => {
    if (!user) {
      setMessage("❌ Please login first");
      return;
    }

    if (selectedProducts.length === 0) {
      setMessage("❌ Select at least one product");
      return;
    }

    navigate("/checkout", {
      state: {
        orderedItems: selectedProducts,
      },
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-4">🛒 Your Cart</h2>

      {message && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">
          {message}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">Your cart is empty 😢</p>
          <Link to="/" className="text-blue-500 mt-2 inline-block">
            Go Shopping →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl shadow flex gap-4 items-center"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(p.id)}
                  onChange={() => toggleSelectItem(p.id)}
                />

                <img
                  src={p.image}
                  alt={p.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-green-600 font-bold">₹{p.price}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQty(p.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{p.quantity}</span>

                    <button
                      onClick={() => increaseQty(p.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(p.id)}
                    className="text-red-500 text-sm mt-2"
                  >
                    Remove
                  </button>
                </div>

                <div className="font-bold">₹{p.price * p.quantity}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl shadow h-fit">
            <h3 className="text-xl font-bold mb-4">Cart Summary</h3>

            <div className="flex justify-between mb-2">
              <span>Selected Items</span>
              <span>{selectedItems.length}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Total Quantity</span>
              <span>
                {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Total</span>
              <span className="font-bold">₹{totalAmount}</span>
            </div>

            <button
              onClick={placeOrder}
              className="bg-green-500 text-white w-full py-2 mt-4 rounded hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;