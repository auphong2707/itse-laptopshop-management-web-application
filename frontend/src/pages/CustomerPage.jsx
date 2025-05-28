import { useMemo } from "react";
import { Layout, Typography, Breadcrumb, Tabs, Row, Col } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import MyOrder from "../components/customer_page/MyOrder";

const { Content } = Layout;
const { Text } = Typography;

const StyledTabs = styled(Tabs)` /* ... */ `;

const CustomerPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();

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

  const handleTabChange = (key) => {
    navigate(`/customer/${key}`);
  };

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

        <StyledTabs
          activeKey={activeKey}
          onChange={handleTabChange}
        >
          {tabs.map((tab) => (
            <Tabs.TabPane tab={tab.label} key={tab.key} />
          ))}
        </StyledTabs>

          {tabs.find((t) => t.key === activeKey)?.content}
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerPage;
