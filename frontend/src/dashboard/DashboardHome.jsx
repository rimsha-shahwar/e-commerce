import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { Package, IndianRupee, Layers } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardHome = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeName, setStoreName] = useState("My E-Commerce");
  const [logoPreview, setLogoPreview] = useState("");
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/settings");
      setStoreName(res.data?.store_name || "My E-Commerce");
      setLogoPreview(res.data?.logo_preview || "");
      setCurrency(res.data?.currency || "INR");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:8000/products");
    setProducts(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:8000/orders");

    const parsed = res.data.map((o) => ({
      ...o,
      products:
        typeof o.products === "string"
          ? JSON.parse(o.products)
          : o.products || [],
    }));

    setOrders(parsed);
  };

  const formatCurrency = (amount) => {
    if (currency === "USD") return `$${Number(amount || 0).toLocaleString()}`;
    if (currency === "AED") return `AED ${Number(amount || 0).toLocaleString()}`;
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const totalProducts = products.length;

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  );

  const totalOrders = orders.length;

  const productSales = {};
  orders.forEach((order) => {
    order.products.forEach((p) => {
      if (!productSales[p.name]) productSales[p.name] = 0;
      productSales[p.name] += p.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const categoryData = categories.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  const priceData = products.map((p) => ({
    name: p.name,
    value: Number(p.price || 0),
  }));

  const COLORS = ["#3B82F6", "#22C55E", "#A855F7", "#F59E0B", "#EF4444"];

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Store Logo"
            className="w-14 h-14 rounded-full object-cover border"
          />
        ) : null}

        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">{storeName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow flex justify-between">
          <div>
            <p>Total Products</p>
            <h2 className="text-2xl font-bold">{totalProducts}</h2>
          </div>
          <Package className="text-blue-500" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex justify-between">
          <div>
            <p>Total Value</p>
            <h2 className="text-2xl font-bold">{formatCurrency(totalValue)}</h2>
          </div>
          <IndianRupee className="text-green-500" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex justify-between">
          <div>
            <p>Categories</p>
            <h2 className="text-2xl font-bold">{categories.length}</h2>
          </div>
          <Layers className="text-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Orders</p>
          <h2 className="text-2xl font-bold">{totalOrders}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Revenue</p>
          <h2 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Products per Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Price Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={priceData} dataKey="value" outerRadius={100}>
                {priceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h3 className="font-bold mb-4">Top Selling Products</h3>

        {topProducts.length === 0 ? (
          <p>No sales yet</p>
        ) : (
          <ul>
            {topProducts.map((p, i) => (
              <li key={i} className="flex justify-between border-b py-2">
                <span>{p.name}</span>
                <span>{p.qty} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;