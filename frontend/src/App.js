import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Admin */
import AdminRoute from "./components/AdminRoute";
import DashboardHome from "./dashboard/DashboardHome";
import AddProduct from "./dashboard/AddProduct";
import ManageProducts from "./dashboard/ManageProducts";
import Categories from "./dashboard/Categories";
import Orders from "./dashboard/Orders";
import User from "./dashboard/User";
import AdminAuth from "./dashboard/AdminRegister";
import ContentControl from "./dashboard/ContentControl";
import CheckUserStatus from "./components/CheckUserStatus";

/* User */
import Home from "./user/Home";
import Signup from "./user/Signup";
import LoginUser from "./user/LoginUser";
import ProductDetails from "./user/ProductDetails";
import Wishlist from "./user/Wishlist";
import Profile from "./user/Profile";

/* Cart + Orders */
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Address from "./pages/Address";
import AddAddress from "./pages/AddAddress";
import ConfirmOrder from "./pages/ConfirmOrder";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

/* Owner */
import OwnerRegister from "./owner/OwnerRegister";
import OwnerLogin from "./owner/OwnerLogin";
import OwnerRoute from "./components/owner/OwnerRoute";
import OwnerLayout from "./owner/OwnerLayout";
import OwnerHome from "./owner/OwnerHome";
import ManageUsers from "./owner/ManageUsers";
import ManageAdmins from "./owner/ManageAdmins";
import OwnerOverview from "./owner/OwnerOverview";
import OwnerOrders from "./owner/OwnerOrders";
import OwnerAnalytics from "./owner/OwnerAnalytics";
import OwnerSettings from "./owner/OwnerSettings";

function App() {
  return (
    <BrowserRouter>
      <CheckUserStatus />

      <Routes>
        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminAuth />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardHome />
            </AdminRoute>
          }
        />

        <Route path="/admin/add" element={<AddProduct />} />
        <Route path="/admin/manage" element={<ManageProducts />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<User />} />
        <Route path="/admin/content" element={<ContentControl />} />

        {/* ================= OWNER AUTH ================= */}
        <Route path="/owner/register" element={<OwnerRegister />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

        {/* ================= OWNER DASHBOARD ================= */}
        <Route
          path="/owner/dashboard"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <OwnerHome />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/users"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <ManageUsers />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/admins"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <ManageAdmins />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/orders"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <OwnerOrders />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/analytics"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <OwnerAnalytics />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/settings"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <OwnerSettings />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/dashboard/overview"
          element={
            <OwnerRoute>
              <OwnerLayout>
                <OwnerOverview />
              </OwnerLayout>
            </OwnerRoute>
          }
        />

        {/* ================= USER ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/user/login" element={<LoginUser />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* ================= CART ================= */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/address" element={<Address />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/confirm-order" element={<ConfirmOrder />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;