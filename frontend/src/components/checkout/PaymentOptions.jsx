import React from "react";

const PaymentOptions = ({ payment, setPayment }) => {
  const options = [
    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
    { id: "card", label: "Credit / Debit Card", desc: "Visa, MasterCard, RuPay" },
    { id: "upi", label: "UPI / Wallet", desc: "Google Pay, PhonePe, Paytm" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => setPayment(option.id)}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
            payment === option.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{option.label}</h4>
              <p className="text-sm text-gray-500">{option.desc}</p>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                payment === option.id
                  ? "border-green-500"
                  : "border-gray-400"
              }`}
            >
              {payment === option.id && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentOptions;