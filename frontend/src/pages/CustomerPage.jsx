import { useMemo } from "react";
import { Layout, Typography, Breadcrumb } from "antd";
import { Link, useParams } from "react-router-dom";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import MyOrder from "../components/customer_page/MyOrder";

const { Content } = Layout;
const { Text } = Typography;

const CustomerPage = () => {
  const { section } = useParams();

  const tabs = useMemo(
    () => [
      {
        key: "accountInformation",
        label: "Account Information",
        content: <Text>Manage your account details here.</Text>,
      },
      {
        key: "orders",
        label: "My Orders",
        content: <MyOrder />,
      },
      {
        key: "productReviews",
        label: "Product Reviews",
        content: <Text>Your product reviews will be listed here.</Text>,
      },
      {
        key: "newsletterSubscriptions",
        label: "Newsletter Subscriptions",
        content: <Text>Manage your newsletter subscriptions here.</Text>,
      },
    ],
    []
  );

  const activeKey =
    tabs.find((t) => t.key === section)?.key || "accountInformation";

  return (
    <Layout>
      <WebsiteHeader />
      <Content className="responsive-padding" style={{ background: "#fff" }}>
        <Breadcrumb separator=">" style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/customer">Customer Dashboard</Link>
          </Breadcrumb.Item>
        </Breadcrumb>

          {tabs.find((t) => t.key === activeKey)?.content}
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerPage;
