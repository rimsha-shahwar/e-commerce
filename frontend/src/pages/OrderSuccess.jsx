import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    order_id,
    payment,
    payment_status,
    total,
    orderedItems = [],
  } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Order Successful
        </h1>

        <p className="text-gray-600 mb-4">
          Your payment was completed successfully.
        </p>

        <div className="text-left bg-gray-50 rounded-xl p-4 mb-4">
          <p className="mb-2">
            <strong>Order ID:</strong> {order_id}
          </p>
          <p className="mb-2">
            <strong>Payment Mode:</strong> {payment}
          </p>
          <p className="mb-2">
            <strong>Payment Status:</strong> {payment_status}
          </p>
          <p className="mb-2">
            <strong>Total:</strong> ₹{total}
          </p>

          <div className="mt-3">
            <strong>Items:</strong>
            {orderedItems.map((item, index) => (
              <p key={index} className="text-sm text-gray-700">
                {item.name} × {item.quantity}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;