import React from "react";

const CartSummary = ({ selectedItems, total, onCheckout }) => {
  return (
    <div style={{ border: "1px solid black", padding: "15px" }}>
      <h3>Cart Summary</h3>

      <p>Selected Items: {selectedItems}</p>
      <h4>Total: ₹{total}</h4>

      <button onClick={onCheckout}>
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;