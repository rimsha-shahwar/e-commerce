import React from "react";

const AddressCard = ({ address, selected, onSelect }) => {
  const isSelected = selected === address.id;

  return (
    <div
      onClick={() => onSelect(address.id)}
      className={`p-4 rounded-xl shadow cursor-pointer transition ${
        isSelected
          ? "border-2 border-green-500 bg-green-50"
          : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{address.name}</h3>
          <p className="text-sm text-gray-600">{address.phone}</p>

          <p className="mt-2 text-gray-700">
            {address.address_line}, {address.city}
          </p>
          <p className="text-gray-700">
            {address.state} - {address.pincode}
          </p>
        </div>

        <input
          type="radio"
          checked={isSelected}
          readOnly
        />
      </div>
    </div>
  );
};

export default AddressCard;