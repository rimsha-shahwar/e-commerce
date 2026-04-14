import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin");

  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminRoute;