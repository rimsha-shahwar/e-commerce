import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const [reviews, setReviews] = useState(
    JSON.parse(localStorage.getItem("reviews_" + id)) || []
  );

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const discounts =
    JSON.parse(localStorage.getItem("discounts")) || {};

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/products");

        const data = res.data;
        setAllProducts(data);

        const found = data.find((p) => p.id === Number(id));
        setProduct(found);

        if (found) {
          setActiveImage(found.image);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // Add to Cart
  const addToCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post("http://localhost:8000/cart", {
        user_id: user.id,
        product_id: productId,
        quantity: quantity,
      });

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
    }
  };

  // Buy Now
  const buyNow = () => {
    if (!product) return;

    const item = { ...product, quantity };

    navigate("/checkout", {
      state: {
        orderedItems: [item],
      },
    });
  };

  // Add Review
  const addReview = () => {
    if (!comment.trim()) return;

    const newReview = { rating, comment };
    const updated = [...reviews, newReview];

    setReviews(updated);
    localStorage.setItem("reviews_" + id, JSON.stringify(updated));

    setComment("");
    setRating(5);
  };

  if (!product) return <p className="p-4">Loading...</p>;

  // Discount
  const categoryDiscount =
    discounts[product.category?.toLowerCase()] || 0;

  const finalPrice =
    categoryDiscount > 0
      ? Math.round(
          product.price - (product.price * categoryDiscount) / 100
        )
      : product.price;

  // Avg rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((a, b) => a + b.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // Related products
  const relatedProducts = allProducts.filter(
    (p) =>
      p.category === product.category &&
      p.id !== product.id
  );

  return (
    <>
      <Navbar />

      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={activeImage || "https://via.placeholder.com/400"}
              className="w-full h-96 object-cover rounded"
              alt={product.name}
            />

            <div className="flex gap-2 mt-3">
              {[product.image, ...(product.images || [])].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(img)}
                  className="w-16 h-16 object-cover border cursor-pointer"
                  alt={`product-${i}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold">{product.name}</h2>

            <p className="mt-2 text-yellow-500">
              ⭐ {avgRating} ({reviews.length} reviews)
            </p>

            <p className="mt-2 font-semibold">
              {product.stock > 0
                ? "🟢 In Stock"
                : "🔴 Out of Stock"}
            </p>

            <p className="text-gray-600 mt-2">
              {product.description || "No description"}
            </p>

            <div className="mt-4">
              {categoryDiscount > 0 ? (
                <>
                  <p className="line-through text-gray-500">
                    ₹{product.price}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{finalPrice}
                  </p>
                  <span className="text-red-500 font-bold">
                    🔥 {categoryDiscount}% OFF
                  </span>
                </>
              ) : (
                <p className="text-2xl font-bold">
                  ₹{product.price}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                -
              </button>

              <span className="font-bold">{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                disabled={product.stock === 0}
                onClick={() => addToCart(product.id)}
                className={`px-6 py-2 text-white rounded ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500"
                }`}
              >
                Add to Cart
              </button>

              <button
                disabled={product.stock === 0}
                onClick={buyNow}
                className={`px-6 py-2 text-white rounded ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500"
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-3">Reviews</h3>

          <div className="mb-4">
            <div className="flex gap-1 text-2xl mb-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  onClick={() => setRating(num)}
                  className={`cursor-pointer ${
                    num <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write review..."
              className="border p-2"
            />

            <button
              onClick={addReview}
              className="bg-blue-500 text-white px-4 py-2 ml-2"
            >
              Submit
            </button>
          </div>

          {reviews.map((r, i) => (
            <div key={i} className="border p-2 mb-2">
              ⭐ {r.rating} - {r.comment}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">
            Related Products
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="border p-3 rounded cursor-pointer"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <img
                  src={p.image || "https://via.placeholder.com/150"}
                  className="h-32 w-full object-cover"
                  alt={p.name}
                />
                <h4 className="font-semibold">{p.name}</h4>
                <p>₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;