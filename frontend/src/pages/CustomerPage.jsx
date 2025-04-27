import { useState } from "react";
import { Layout, Typography, Breadcrumb, Tabs, Row, Col } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import AccountDashboard from "../components/customer_page/AccountDashboard";
import MyOrder from "../components/customer_page/MyOrder";

const { Content } = Layout;
const { Title, Text } = Typography;

const Sidebar = styled(Col)`
  background: #fff;
  padding: 20px;
  width: 95vw !important;
`;

const StyledTabs = styled(Tabs)`
  background: #e9ecef;
  padding: 20px 5px;
  .ant-tabs-tab {
    padding: 12px 16px;
    width: 100%;
    text-align: left;
    font-weight: normal;
  }
  .ant-tabs-tab-active {
    font-weight: bold;
    color: #1890ff;
  }
  .ant-tabs-ink-bar {
    background: #1890ff;
    height: 3px;
    left: 0;
  }
  .ant-tabs-nav {
    width: 100%;
  }
  .ant-tabs-content-holder {
    display: none !important;
    width: 0;
  }
  .ant-tabs-tab:nth-child(5),
  .ant-tabs-tab:nth-child(9) {
    border-top: 1px solid #ccc;
    width: 100%;
  }
`;

const CustomerPage = () => {
  const [selectedTab, setSelectedTab] = useState("accountDashboard");

  const tabs = [
    {
      key: "accountDashboard",
      label: "Account Dashboard",
      content: <AccountDashboard />,
    },
    {
      key: "accountInformation",
      label: "Account Information",
      content: <Text>Manage your account details here.</Text>,
    },
    {
      key: "addressBook",
      label: "Address Book",
      content: <Text>Your saved addresses will appear here.</Text>,
    },
    {
      key: "orders",
      label: "My Order",
      content: <MyOrder />,
    },
    {
      key: "downloadableProducts",
      label: "My Downloadable Products",
      content: <Text>Downloadable products will appear here.</Text>,
    },
    {
      key: "paymentMethods",
      label: "Stored Payment Methods",
      content: <Text>Stored payment methods will be listed here.</Text>,
    },
    {
      key: "billingAgreements",
      label: "Billing Agreements",
      content: <Text>Your billing agreements are shown here.</Text>,
    },
    {
      key: "wishList",
      label: "My Wish List",
      content: <Text>Items in your wish list will be displayed here.</Text>,
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
  ];

  return (
    <Layout>
      <WebsiteHeader />
      <Content
        className="responsive-padding"
        style={{ backgroundColor: "#fff" }}
      >
        <Breadcrumb separator=">" style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/customer">My Dashboard</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Title level={2}>My Dashboard</Title>
        <Row gutter={16}>
          <Sidebar flex="1">
            <StyledTabs
              activeKey={selectedTab}
              onChange={setSelectedTab}
              tabPosition="left"
            >
              {tabs.map((tab) => (
                <Tabs.TabPane tab={tab.label} key={tab.key} />
              ))}
            </StyledTabs>

            <div
              style={{
                background: "#e9ecef",
                padding: "10px 20px 20px 20px",
                marginTop: "20px",
                textAlign: "center",
                width: "100%",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px",
                  display: "block",
                  marginTop: "12px",
                  paddingBottom: "8px",
                }}
              >
                Compare Products
              </Text>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                You have no items to compare.
              </p>
            </div>

            <div
              style={{
                background: "#e9ecef",
                padding: "10px 20px 20px 20px",
                marginTop: "20px",
                textAlign: "center",
                width: "100%",
                position: "relative",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px",
                  display: "block",
                  marginTop: "12px",
                  paddingBottom: "8px",
                }}
              >
                My Wish List
              </Text>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                You have no items in your wish list.
              </p>
            </div>
          </Sidebar>

          <Col flex="3">
            {tabs.find((tab) => tab.key === selectedTab)?.content}
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerPage;
