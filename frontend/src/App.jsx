import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import { UserProvider } from "./utils/UserContext";
import AdministratorPage, {
  AdminCatalog,
  Detail,
  Orders,
  RefundRequest,
  StockAlert,
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
    path: "/customer",
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
        path: "catalog/:brand",
        element: <AdminCatalog />,
      },
      {
        path: "detail",
        element: <Detail />,
      },
      {
        path: "detail/:id",
        element: <Detail />,
      },
      {
        path: "refund",
        element: <RefundRequest />,
      },
      {
        path: "stock-alerts",
        element: <StockAlert />,
      },
      {
        path: "orders",
        element: <Orders />,
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
