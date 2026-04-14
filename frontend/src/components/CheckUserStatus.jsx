import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CheckUserStatus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {

      // ✅ If owner logged in → skip user check
      const owner = localStorage.getItem("owner");
      if (owner) return;
      
      // ✅ SUPER SAFE PARSE
      const rawUser = localStorage.getItem("user");

      if (!rawUser || rawUser === "undefined") return;

      let user;
      try {
        user = JSON.parse(rawUser);
      } catch {
        return; // stop if invalid JSON
      }

      if (!user || !user.id) return;

      try {
        const res = await axios.get(
          `http://localhost:8000/users/${user.id}`
        );

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