import React, { useState } from "react";
import { Layout, Typography, Breadcrumb, Tabs, Card, Row, Col } from "antd";
import styled from "styled-components";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";

const { Content } = Layout;
const { Title, Text } = Typography;

const StyledTabs = styled(Tabs)`
  .ant-tabs-tab-active {
    border-right: none important;
  }
`;

const CustomerPage = () => {
  const [selectedTab, setSelectedTab] = useState("accountDashboard");

  const tabs = [
    {
      key: "accountDashboard",
      label: "Account Dashboard",
      content: (
        <div>
          <Title level={3}>Account Information</Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Text strong>Contact Information</Text>
                <p>Alex Driver</p>
                <p>ExampleAdress@gmail.com</p>
                <Text type="link">Edit</Text> | <Text type="link">Change Password</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Text strong>Newsletters</Text>
                <p>You don’t subscribe to our newsletter.</p>
                <Text type="link">Edit</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Text strong>Address Book</Text>
                <p>Default Billing Address: Not Set</p>
                <p>Default Shipping Address: Not Set</p>
                <Text type="link">Edit Address</Text>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "addressBook",
      label: "Address Book",
      content: <Text>Your saved addresses will appear here.</Text>,
    },
    {
      key: "orders",
      label: "My Orders",
      content: <Text>No orders found.</Text>,
    },
  ];

  return (
    <Layout>
      <WebsiteHeader />
      <Content style={{ padding: "20px 50px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>My Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={2}>My Dashboard</Title>
        <Row gutter={16}>
          <Col span={6}>
            <StyledTabs activeKey={selectedTab} onChange={setSelectedTab} tabPosition="left">
              {tabs.map((tab) => (
                <Tabs.TabPane tab={tab.label} key={tab.key} />
              ))}
            </StyledTabs>
          </Col>
          <Col span={18}>
            {tabs.find((tab) => tab.key === selectedTab)?.content}
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerPage;
