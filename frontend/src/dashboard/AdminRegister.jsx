import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API_BASE_URL from "../config";

const AdminAuth = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.email || !form.password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/admin/register`, form);

      setMessage(res.data?.message || "🎉 Registered Successfully");
      localStorage.setItem("admin", "true");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      setMessage(err.response?.data?.detail || "Registration Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.password) {
      setMessage("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: form.email,
        password: form.password,
      });

      setMessage(res.data?.message || "✅ Login Successful");
      localStorage.setItem("admin", "true");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      setMessage(err.response?.data?.detail || "❌ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[350px] text-white">
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? "Admin Login" : "Admin Register"}
        </h2>

        <p className="text-center text-sm mb-6 text-gray-200">
          {isLogin ? "Welcome back 👋" : "Create your admin account"}
        </p>

        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {!isLogin && (
            <div className="flex items-center bg-white/30 p-2 rounded-lg">
              <FaUser className="mx-2" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-white"
              />
            </div>
          )}

          <div className="flex items-center bg-white/30 p-2 rounded-lg">
            <FaEnvelope className="mx-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-white"
            />
          </div>

          <div className="flex items-center bg-white/30 p-2 rounded-lg">
            <FaLock className="mx-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-white"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer px-2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-70"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login 🔐"
              : "Register 🚀"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-3 text-sm font-semibold text-white">
            {message}
          </p>
        )}

        <p className="text-center mt-4 text-sm text-gray-200">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="ml-2 underline cursor-pointer"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;