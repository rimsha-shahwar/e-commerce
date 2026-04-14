import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []);
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsBanner, setSettingsBanner] = useState("");

  const banner = localStorage.getItem("banner");
  const offer = localStorage.getItem("offer");
  const discounts = JSON.parse(localStorage.getItem("discounts")) || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8000/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const fetchWishlist = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setWishlist([]);
      localStorage.setItem("wishlist", JSON.stringify([]));
      window.dispatchEvent(new Event("wishlistUpdated"));
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/wishlist/${user.id}`);
      setWishlist(res.data || []);
      localStorage.setItem("wishlist", JSON.stringify(res.data || []));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      setWishlist([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/settings");
      setMaintenanceMode(res.data?.maintenance_mode || false);
      setSettingsBanner(res.data?.banner_preview || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWishlist();
    fetchSettings();
  }, []);

  useEffect(() => {
    const syncCart = () => {
      setCart(JSON.parse(localStorage.getItem("cart")) || []);
    };

    const syncWishlist = () => {
      setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []);
    };

    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("wishlistUpdated", syncWishlist);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("wishlistUpdated", syncWishlist);
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setSearchTerm("");
    setSelectedCategory("");
    await fetchProducts();
    await fetchCategories();
    await fetchWishlist();
    await fetchSettings();
    setLoading(false);
  };

  const addToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      return;
    }

    try {
      await axios.post("http://localhost:8000/cart/", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });

      let existingCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingIndex = existingCart.findIndex((item) => item.id === product.id);

      if (existingIndex !== -1) {
        existingCart[existingIndex].quantity =
          (existingCart[existingIndex].quantity || 1) + 1;
      } else {
        existingCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(existingCart));
      setCart(existingCart);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      return;
    }

    try {
      const exists = wishlist.find((p) => p.id === product.id);

      if (exists) {
        await axios.delete("http://localhost:8000/wishlist/remove", {
          data: {
            user_id: user.id,
            product_id: product.id,
          },
        });

        const newWishlist = wishlist.filter((p) => p.id !== product.id);
        setWishlist(newWishlist);
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      } else {
        await axios.post("http://localhost:8000/wishlist/", {
          user_id: user.id,
          product_id: product.id,
        });

        const newWishlist = [...wishlist, product];
        setWishlist(newWishlist);
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryClick = (name) => {
    setSelectedCategory(name);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchSearch = p.name
      ?.toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (maintenanceMode) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <h2 className="text-2xl font-bold mb-3">Site Under Maintenance</h2>
            <p className="text-gray-600">
              We are currently updating the store. Please come back later.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-4 flex gap-3 items-center">
        <button onClick={() => setSidebarOpen(true)}>
          <FaBars size={20} />
        </button>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pr-10"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={handleRefresh}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="flex">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}

        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between p-4 bg-blue-500 text-white">
            <h2>Categories</h2>
            <FaTimes onClick={() => setSidebarOpen(false)} />
          </div>

          <div className="p-3">
            <button
              onClick={() => setSelectedCategory("")}
              className="w-full text-left p-2"
            >
              All Products
            </button>

            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  handleCategoryClick(cat.name);
                  setSidebarOpen(false);
                }}
                className="p-2 cursor-pointer hover:bg-gray-100 flex gap-2 items-center"
              >
                <img
                  src={cat.image || "https://via.placeholder.com/40"}
                  className="w-8 h-8 rounded"
                  alt={cat.name}
                />
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4">
          {settingsBanner ? (
            <img
              src={settingsBanner}
              alt="Store Banner"
              className="w-full h-48 object-cover rounded mb-4"
            />
          ) : banner ? (
            <div className="bg-yellow-300 p-3 mb-2">{banner}</div>
          ) : null}

          {offer && (
            <div className="bg-red-500 text-white p-3 mb-4">{offer}</div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition ${
                  selectedCategory === cat.name ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <img
                  src={cat.image || "https://via.placeholder.com/300"}
                  className="h-32 w-full object-cover"
                  alt={cat.name}
                />
                <div className="p-2 text-center font-semibold">
                  {cat.name}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const categoryDiscount =
                  discounts[p.category?.toLowerCase()] || 0;

                const finalPrice =
                  categoryDiscount > 0
                    ? Math.round(
                        p.price - (p.price * categoryDiscount) / 100
                      )
                    : p.price;

                return (
                  <div
                    key={p.id}
                    className={`border p-3 rounded shadow ${
                      categoryDiscount > 0 ? "border-green-500" : ""
                    }`}
                  >
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={p.image}
                        className="h-40 w-full object-cover"
                        alt={p.name}
                      />
                    </Link>

                    <h3 className="font-bold mt-2">{p.name}</h3>

                    {categoryDiscount > 0 ? (
                      <>
                        <p className="text-sm text-gray-500 line-through">
                          ₹{p.price}
                        </p>

                        <p className="text-lg font-bold text-green-600">
                          ₹{finalPrice}
                        </p>

                        <span className="text-red-500 text-xs font-bold">
                          🔥 {categoryDiscount}% OFF
                        </span>

                        <p className="text-xs text-gray-600">
                          You save ₹{p.price - finalPrice}
                        </p>
                      </>
                    ) : (
                      <p className="font-bold">₹{p.price}</p>
                    )}

                    <button onClick={() => toggleWishlist(p)}>
                      {wishlist.find((w) => w.id === p.id) ? (
                        <AiFillHeart color="red" />
                      ) : (
                        <AiOutlineHeart />
                      )}
                    </button>

                    <button
                      onClick={() => addToCart(p)}
                      className="bg-blue-500 text-white w-full mt-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;