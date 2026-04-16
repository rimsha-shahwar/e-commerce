import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API_BASE_URL from "../config";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;

  // ✅ Show message if redirected (blocked user)
  useEffect(() => {
    if (redirectMessage) {
      setMessage(redirectMessage);
      setIsBlocked(true);

      // remove message after using once
      window.history.replaceState({}, document.title);
    }
  }, []);

  // ✅ Auto hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // ✅ Handle input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsBlocked(false);
    setMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsBlocked(false);
    setMessage("");
  };

  // ✅ LOGIN FUNCTION
  const handleLogin = async () => {
    try {
      // 🔒 Basic validation
      if (!email || !password) {
        setMessage("❌ Please enter email & password");
        return;
      }

      // 🔍 Check user status FIRST
      const checkRes = await axios.get(
        `${API_BASE_URL}/users/check-by-email`,
        {
          params: {
            email: email.trim(),
          },
        }
      );

      // ❌ If blocked
      if (checkRes.data.is_active === false) {
        setMessage("❌ Your account is blocked");
        setIsBlocked(true);
        return;
      }

      // ✅ LOGIN
      const res = await axios.post(
        `${API_BASE_URL}/users/login`,
        {
          email: email.trim(),
          password: password.trim(),
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      setMessage("✅ Login successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      console.log(err);

      if (err.response?.status === 403) {
        setMessage("❌ Your account is blocked by admin");
        setIsBlocked(true);
      } else if (err.response?.status === 404) {
        setMessage("❌ User not found");
      } else if (err.response?.status === 422) {
        setMessage("❌ Invalid request (check email format)");
      } else {
        setMessage("❌ Invalid credentials");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[350px] text-white">

        <h2 className="text-3xl font-bold text-center mb-6">
          User Login
        </h2>

        {/* MESSAGE */}
        {message && (
          <p className="text-center mb-3 text-red-300 font-semibold">
            {message}
          </p>
        )}

        {/* EMAIL */}
        <div className="flex items-center bg-white/30 p-2 rounded-lg mb-4">
          <FaEnvelope className="mx-2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className="bg-transparent outline-none w-full placeholder-white"
          />
        </div>

        {/* PASSWORD */}
        <div className="flex items-center bg-white/30 p-2 rounded-lg mb-4">
          <FaLock className="mx-2" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
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
          onClick={handleLogin}
          disabled={isBlocked}
          className={`w-full py-2 rounded-lg font-bold transition ${
            isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white text-purple-600 hover:bg-gray-200"
          }`}
        >
          Login 🚀
        </button>

      </div>
    </div>
  );
};

export default LoginUser;