import React from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdministratorPage from './pages/AdministratorPage';
import CatalogPage from "./pages/CatalogPage";
import CustomerLoginPage from './pages/CustomerLoginPage';
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from './pages/RegisterPage';
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/customer/login",
    element: <CustomerLoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "admin",
    element: <AdministratorPage />,
  },
  {
    path: "/laptops/",
    element: <CatalogPage inputBrand="All" />,
  },
  {
    path: "/product/:id",
    element: <ProductPage />,
  }
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
