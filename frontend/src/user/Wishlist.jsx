import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`http://localhost:8000/wishlist/${user.id}`);
      setWishlist(res.data || []);
      localStorage.setItem("wishlist", JSON.stringify(res.data || []));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

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
    fetchWishlist();
    fetchCart();
  }, [user]);

  const removeItem = async (id) => {
    try {
      await axios.delete("http://localhost:8000/wishlist/remove", {
        data: {
          user_id: user.id,
          product_id: id,
        },
      });

      fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (product) => {
    try {
      await axios.post("http://localhost:8000/cart/", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });

      setMessage("✅ Added to cart!");
      setTimeout(() => setMessage(""), 2000);

      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">❤️ My Wishlist</h2>

        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ⬅ Back
        </button>
      </div>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
          {message}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">Your wishlist is empty 😢</p>
          <Link to="/" className="text-blue-500 mt-2 inline-block">
            Go Shopping →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition relative"
            >
              <Link to={`/product/${p.id}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded"
                />
              </Link>

              <h3 className="font-semibold mt-3">{p.name}</h3>

              <p className="text-green-600 font-bold mt-1">₹{p.price}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addToCart(p)}
                  className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => removeItem(p.id)}
                  className="flex-1 bg-gray-300 py-1 rounded hover:bg-gray-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;