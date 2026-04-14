import React from "react";
import { Navigate } from "react-router-dom";

const OwnerRoute = ({ children }) => {
  const ownerData = localStorage.getItem("owner");

  if (!ownerData || ownerData === "undefined") {
    return <Navigate to="/owner/login" />;
  }

  let owner;

  try {
    owner = JSON.parse(ownerData);
  } catch {
    return <Navigate to="/owner/login" />;
  }

  if (!owner || owner.role !== "owner") {
    return <Navigate to="/owner/login" />;
  }

  return children;
};

export default OwnerRoute;