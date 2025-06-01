import '@ant-design/v5-patch-for-react-19';
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

// Layouts
import AdministratorLayout from "./layouts/AdministratorLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

import { UserProvider } from "./utils/UserContext";
import CatalogPage from "./pages/CatalogPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import SearchPage from "./pages/SearchPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import "./App.css";

// Pages – admin
import AdminDashboardTab from "./pages/admin/AdminDashboardTab.jsx";
import AdminInventoryTab from "./pages/admin/AdminInventoryTab.jsx";
import AdminProductDetailTab from "./pages/admin/AdminProductDetailTab.jsx";
import AdminStockAlertsTab from "./pages/admin/AdminStockAlertsTab.jsx";
import AdminRefundRequestsTab from "./pages/admin/AdminRefundRequestsTab.jsx";
import AdminOrdersTab from "./pages/admin/AdminOrdersTab.jsx";

// Pages – customer
import CustomerOrderTab from "./pages/customer/CustomerOrderTab.jsx";
import CustomerAccountInformationTab from "./pages/customer/CustomerAccountInformationTab.jsx";
import CustomerProductReviewsTab from "./pages/customer/CustomerProductReviewsTab.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollRestoration />
        <HomePage />
      </>
    ),
  },
  {
    path: "/customer/login",
    element: (
      <>
        <ScrollRestoration />
        <CustomerLoginPage />
      </>
    ),
  },
    {
    path: "/customer/place-order",
    element: (
      <>
        <ScrollRestoration />
        <PlaceOrderPage />
      </>
    ),
  },
  {
    path: "/register",
    element: (
      <>
        <ScrollRestoration />
        <RegisterPage />
      </>
    ),
  },
  {
    path: "/admin",
    element: (
      <>
        <ScrollRestoration />
        <AdministratorLayout />
      </>
    ),
    // các trang con xuất hiện trong <Outlet /> của AdministratorLayout
    children: [
      { index: true, element: <AdminDashboardTab /> },         // /admin
      { path: "dashboard", element: <AdminDashboardTab /> },   // /admin/dashboard

      // Inventory theo brand → /admin/inventory/asus
      { path: "inventory/:brand", element: <AdminInventoryTab /> },

      // Thêm mới sản phẩm → /admin/detail
      { path: "detail", element: <AdminProductDetailTab /> },

      // Sửa sản phẩm → /admin/detail/123
      { path: "detail/:id", element: <AdminProductDetailTab /> },

      { path: "stock-alerts", element: <AdminStockAlertsTab /> },     // /admin/stock
      { path: "refund", element: <AdminRefundRequestsTab /> }, // /admin/refund
      { path: "orders", element: <AdminOrdersTab /> },         // /admin/orders
    ],
  },
  {
    path: "/customer",
    element: (
      <>
        <ScrollRestoration />
        <CustomerLayout />
      </>
    ),
    children: [
      { index: true, element: <CustomerAccountInformationTab /> },
      { path: "accountInformation", element: <CustomerAccountInformationTab /> },

      { path: "orders", element: <CustomerOrderTab /> },

      { path: "productReviews", element: <CustomerProductReviewsTab /> },
    ],
  },
  {
    path: "/laptops/:brand",
    element: (
      <>
        <ScrollRestoration />
        <CatalogPage />
      </>
    ),
  },
  {
    path: "/product/:id",
    element: (
      <>
        <ScrollRestoration />
        <ProductPage />
      </>
    ),
  },
  {
    path: "/shopping-cart",
    element: (
      <>
        <ScrollRestoration />
        <ShoppingCartPage />
      </>
    ),
  },
  {
    path: "/search",
    element: (
      <>
        <ScrollRestoration />
        <SearchPage />
      </>
    ),
  }
]);

function App() {
  return (
    <UserProvider>
      <div>
        <RouterProvider router={router} />
      </div>
    </UserProvider>
  );
}

export default App;
