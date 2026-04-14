import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [storeName, setStoreName] = useState("My E-Commerce");
  const [logoPreview, setLogoPreview] = useState("");

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(totalQty);
  };

  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(wishlist.length);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/settings");
      setStoreName(res.data?.store_name || "My E-Commerce");
      setLogoPreview(res.data?.logo_preview || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    fetchSettings();

    const handleCartUpdate = () => updateCartCount();
    const handleWishlistUpdate = () => updateWishlistCount();
    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowDropdown(false);
    setCartCount(0);
    setWishlistCount(0);
    navigate("/user/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold flex items-center gap-2">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="logo"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              background: "#fff",
            }}
          />
        ) : null}
        {storeName}
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/">Home</Link>

        {!user ? (
          <>
            <Link to="/user/signup">Sign Up</Link>
            <Link to="/user/login">Login</Link>
          </>
        ) : (
          <>
            <Link to="/cart" className="relative">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-2 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/wishlist" className="relative">
              ❤️
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-pink-500 text-xs px-2 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={user?.profile_image || "https://placehold.co/40"}
                  alt="profile"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <span>{user?.name}</span>
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    👤 Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    📦 Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;