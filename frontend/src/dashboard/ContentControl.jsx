import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import API_BASE_URL from "../config";

const ContentControl = () => {
  const [banner, setBanner] = useState("");
  const [offer, setOffer] = useState(localStorage.getItem("offer") || "");
  const [logoPreview, setLogoPreview] = useState("");
  const [storeName, setStoreName] = useState("My E-Commerce");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [discount, setDiscount] = useState("");

  const [discounts, setDiscounts] = useState(
    JSON.parse(localStorage.getItem("discounts")) || {}
  );

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      setBanner(res.data?.banner_preview || "");
      setLogoPreview(res.data?.logo_preview || "");
      setStoreName(res.data?.store_name || "My E-Commerce");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addDiscount = () => {
    if (!selectedCategory || !discount) {
      alert("Select category & discount");
      return;
    }

    const updated = {
      ...discounts,
      [selectedCategory.toLowerCase()]: Number(discount),
    };

    setDiscounts(updated);
    localStorage.setItem("discounts", JSON.stringify(updated));

    setSelectedCategory("");
    setDiscount("");
  };

  const removeDiscount = (cat) => {
    const updated = { ...discounts };
    delete updated[cat];

    setDiscounts(updated);
    localStorage.setItem("discounts", JSON.stringify(updated));
  };

  const saveContent = () => {
    localStorage.setItem("offer", offer);
    alert("✅ Offer Updated!");
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-center">
          🎯 Content Control Panel
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div>
            <label className="font-semibold">Store Name</label>
            <div className="mt-2 p-3 border rounded bg-gray-50">{storeName}</div>
          </div>

          <div>
            <label className="font-semibold">Store Logo</label>
            <div className="mt-2">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Store Logo"
                  className="w-24 h-24 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg border bg-gray-50 flex items-center justify-center text-gray-500">
                  No Logo
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold">Homepage Banner</label>
            <div className="mt-2">
              {banner ? (
                <img
                  src={banner}
                  alt="Homepage Banner"
                  className="w-full h-48 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-full h-40 rounded-lg border bg-gray-50 flex items-center justify-center text-gray-500">
                  No Banner
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold">Offer Text</label>
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="border p-2 w-full mt-1 rounded"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-bold mb-2">Add Category Discount</h3>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Discount %"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            />

            <button
              onClick={addDiscount}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              ➕ Add Discount
            </button>
          </div>

          <button
            onClick={saveContent}
            className="bg-blue-500 text-white px-6 py-2 rounded w-full"
          >
            💾 Save Offer
          </button>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Active Discounts</h3>

            {Object.keys(discounts).length === 0 ? (
              <p>No discounts added.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Category</th>
                    <th className="p-2">Discount</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(discounts).map(([cat, val]) => (
                    <tr key={cat} className="text-center border-t">
                      <td className="p-2">{cat}</td>
                      <td className="p-2">{val}%</td>
                      <td className="p-2">
                        <button
                          onClick={() => removeDiscount(cat)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContentControl;