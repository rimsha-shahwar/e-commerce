import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const CheckUserStatus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      const owner = localStorage.getItem("owner");
      if (owner) return;

      const rawUser = localStorage.getItem("user");
      if (!rawUser || rawUser === "undefined") return;

      let user;
      try {
        user = JSON.parse(rawUser);
      } catch {
        return;
      }

      if (!user || !user.id) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/users/${user.id}`);

        if (res.data.is_active === false) {
          localStorage.removeItem("user");
          navigate("/login", {
            state: {
              message: "❌ Your account has been blocked by admin",
            },
          });
        }
      } catch (err) {
        console.log("Status check error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
};

export default CheckUserStatus;