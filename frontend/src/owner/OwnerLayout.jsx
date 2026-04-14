import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import OwnerSidebar from "./OwnerSidebar";

const OwnerLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        fontFamily: "Arial",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          height: "70px",
          background: "#111827",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            border: "1px solid #fff",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <h2 style={{ margin: 0, fontSize: "18px" }}>👑 Owner Panel</h2>
      </div>

      <OwnerSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          padding: "20px",
          background: "#f3f4f6",
          overflowY: "auto",
          height: "calc(100vh - 70px)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default OwnerLayout;