import { Layout, Breadcrumb } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import WebsiteHeader from "../components/WebsiteHeader.jsx";
import WebsiteFooter from "../components/WebsiteFooter.jsx";

const { Content } = Layout;

const pathToName = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  detail: "Product Detail",
  refund: "Refund Requests",
  stock: "Stock Alerts",
  orders: "Orders",
};

export default function AdministratorLayout() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);          // ['admin', 'detail', '123']
  const current = segments[1] || "dashboard";
  const extra =
    current === "detail" && segments[2]
      ? `: ${segments[2]}`
      : current === "detail"
      ? " (Add Product)"
      : "";

  return (
    <Layout>
      <WebsiteHeader />

      <Content style={{ padding: "1.5rem 12%", background: "#fff" }}>
        <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>Admin</Breadcrumb.Item>
          <Breadcrumb.Item>
            {pathToName[current] || current}
            {extra}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* hiển thị page con */}
        <Outlet />
      </Content>

      <WebsiteFooter />
    </Layout>
  );
}
