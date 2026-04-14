import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const OwnerRegister = () => {
  const [name, setName] = useState("");   // ✅ ADD NAME
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/owner/register", {
        name,        // ✅ REQUIRED
        email,
        password
      });

      alert("Owner registered successfully");
      navigate("/owner/login");

    } catch (err) {
      console.log("ERROR:", err.response?.data); // 👈 IMPORTANT DEBUG
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Owner Register 👑</h2>

        {/* ✅ NAME INPUT */}
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-3 p-2 border"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white p-2 rounded">
          Register
        </button>

        <p className="text-sm mt-3">
          Already have account?{" "}
          <Link to="/owner/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default OwnerRegister;