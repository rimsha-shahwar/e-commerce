import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // 🔥 API call
      const res = await axios.post(
        `${API_BASE_URL}/users/signup`,
        { name, email, password }
      );

      const newUser = res.data;

      // ✅ Save current user (for login/session)
      localStorage.setItem("user", JSON.stringify(newUser));

      // ✅ ALSO store in users list (for profile system)
      const existingUsers =
        JSON.parse(localStorage.getItem("users")) || [];

      existingUsers.push(newUser);

      localStorage.setItem("users", JSON.stringify(existingUsers));

      alert("Signup successful!");
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.detail || "Error signing up");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">

      <h2 className="text-2xl mb-4 font-bold text-center">
        Create Account
      </h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        onClick={handleSignup}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Signup
      </button>

    </div>
  );
};

export default Signup;