import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config";

const OwnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/owner/login`, {
        email,
        password,
      });

      console.log("Owner response:", res.data); // ✅ debug

      
      localStorage.setItem("owner", JSON.stringify(res.data));

      navigate("/owner/dashboard", { replace: true});

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 shadow rounded w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          Owner Login 👑
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* LOGIN BUTTON */}
        <button className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
          Login
        </button>

        {/* REGISTER LINK */}
        <p className="text-sm mt-3 text-center">
          New owner?{" "}
          <Link to="/owner/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default OwnerLogin;