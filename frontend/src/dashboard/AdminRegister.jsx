import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const AdminAuth = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);

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

  // ✅ REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/admin/register", form);

      setMessage("🎉 Registered Successfully");

      localStorage.setItem("admin", "true");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration Error");
    }
  };

  // ✅ LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/admin/login", {
        email: form.email,
        password: form.password,
      });

      setMessage("✅ Login Successful");

      localStorage.setItem("admin", "true");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);

    } catch (err) {
      setMessage("❌ Invalid email or password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[350px] text-white">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? "Admin Login" : "Admin Register"}
        </h2>

        <p className="text-center text-sm mb-6 text-gray-200">
          {isLogin ? "Welcome back 👋" : "Create your admin account"}
        </p>

        {/* FORM */}
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="space-y-4"
        >

          {/* NAME (REGISTER ONLY) */}
          {!isLogin && (
            <div className="flex items-center bg-white/30 p-2 rounded-lg">
              <FaUser className="mx-2" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-white"
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="flex items-center bg-white/30 p-2 rounded-lg">
            <FaEnvelope className="mx-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-white"
            />
          </div>

          {/* PASSWORD WITH SHOW/HIDE */}
          <div className="flex items-center bg-white/30 p-2 rounded-lg">
            <FaLock className="mx-2" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
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

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-white text-purple-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
          >
            {isLogin ? "Login 🔐" : "Register 🚀"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p className="text-center mt-3 text-sm font-semibold text-white">
            {message}
          </p>
        )}

        {/* TOGGLE */}
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