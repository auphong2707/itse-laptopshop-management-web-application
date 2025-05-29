import '@ant-design/v5-patch-for-react-19';
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import { UserProvider } from "./utils/UserContext";
import AdministratorPage, {
  Inventory,
  DetailTab,
  OrdersTab,
  RefundRequestTab,
  StockAlertTab,
  DashboardTab
} from "./pages/AdministratorPage";
import CatalogPage from "./pages/CatalogPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerPage from "./pages/CustomerPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import SearchPage from "./pages/SearchPage";
import "./App.css";

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
    path: "/customer/:section?",
    element: (
      <>
        <ScrollRestoration />
        <CustomerPage />
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
        <AdministratorPage />
      </>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardTab />,
      },
      {
        path: "inventory/:brand",
        element: <Inventory />,
      },
      {
        path: "detail",
        element: <DetailTab />,
      },
      {
        path: "detail/:id",
        element: <DetailTab />,
      },
      {
        path: "refund",
        element: <RefundRequestTab />,
      },
      {
        path: "stock-alerts",
        element: <StockAlertTab />,
      },
      {
        path: "orders",
        element: <OrdersTab />,
      }
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
