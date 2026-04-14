import React from "react";

const CartItem = ({ item, onIncrease, onDecrease, onRemove, onSelect, selected }) => {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
      />

      <img src={item.image} alt={item.name} width="80" />

      <div>
        <h4>{item.name}</h4>
        <p>₹{item.price}</p>

        <button onClick={() => onDecrease(item.id)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => onIncrease(item.id)}>+</button>

        <br />
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>

      <div>₹{item.price * item.quantity}</div>
    </div>
  );
};

export default CartItem;