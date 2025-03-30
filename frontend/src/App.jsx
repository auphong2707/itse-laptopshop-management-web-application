import React from "react";
import { createBrowserRouter, RouterProvider, ScrollRestoration } from "react-router-dom";
import AdministratorPage from "./pages/AdministratorPage";
import { DeletingProducts, Detail } from "./pages/AdministratorPage";
import CatalogPage from "./pages/CatalogPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerPage from "./pages/CustomerPage";
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
        path: "detail",
        element: <Detail />,
      },
      {
        path: "detail/:id",
        element: <Detail />,
      },
      {
        path: "delete",
        element: <DeletingProducts />,
      },
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
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
