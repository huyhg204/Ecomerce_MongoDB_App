import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Admin pages
import AdminProductList from "../pages/admin/AdminProductList";
import AdminAddProduct from "../pages/admin/AdminAddProduct";
import AdminEditProduct from "../pages/admin/AdminEditProduct";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminBrands from "../pages/admin/AdminBrands";
import NewsManager from "../pages/admin/NewsManager";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminBanners from "../pages/admin/AdminBanners";

// User pages
import Home from "../pages/user/Home";
import ProductList from "../pages/user/ProductList";
import Contact from "../pages/user/Contact";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import About from "../pages/user/About";
import News from "../pages/user/News";
import NewsDetail from "../pages/user/NewsDetail";
import Cart from "../pages/user/Cart";
import Checkout from "../pages/user/Checkout";
import Orders from "../pages/user/Orders";
import OrderCheck from "../pages/user/ordercheck";
import OrderSuccess from "../pages/user/OrderSuccess";
import Profile from "../pages/user/Profile";
import Forgotpass from "../pages/user/forgotpass";
import ProductDetail from "../pages/user/ProductDetail";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- User Site ---------- */}
        <Route element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderCheck />
              </ProtectedRoute>
            }
          />
          <Route
            path="order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Không nằm trong UserLayout */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="forgotpass" element={<Forgotpass />} />

        {/* ---------- Admin Site ---------- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminEditProduct />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="news" element={<NewsManager />} />
          <Route path="customers" element={<AdminCustomers />} /> 
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
