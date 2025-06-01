import { Layout, Breadcrumb } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import WebsiteHeader from "../components/WebsiteHeader.jsx";
import WebsiteFooter from "../components/WebsiteFooter.jsx";

const { Content } = Layout;

const pathToName = {
  accountInformation: "Account Information",
  orders: "My Orders",
  productReviews: "Product Reviews",
};

export default function CustomerLayout() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const current = segments[1] || "account";

  return (
    <Layout>
      <WebsiteHeader />

      <Content style={{ padding: "1.5rem 12%", background: "#fff" }}>
        <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>Customer</Breadcrumb.Item>
          <Breadcrumb.Item>{pathToName[current] || current}</Breadcrumb.Item>
        </Breadcrumb>

        <Outlet />
      </Content>

      <WebsiteFooter />
    </Layout>
  );
}
