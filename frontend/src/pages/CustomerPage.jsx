import React, { useState } from "react";
import { Layout, Typography, Breadcrumb, Tabs, Row, Col } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import styled from "styled-components";

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
  .ant-tabs-content-holder {
    display: none !important;
  }
  .ant-tabs-tab:nth-child(5),
  .ant-tabs-tab:nth-child(9) {
    border-top: 1px solid #ccc;
    width: 100%;
  }
`;

const Separator = styled.div`
  height: 1px;
  background: #ccc;
  margin: 10px 0;
`;

const CustomerPage = () => {
  const [selectedTab, setSelectedTab] = useState("accountDashboard");

  const tabs = [
    {
      key: "accountDashboard",
      label: "Account Dashboard",
      content: (
        <div style={{ paddingLeft: "40px", marginTop: "-2px" }}>
          <Title level={4} style={{ marginBottom: "10px" }}>Account Information</Title>
          <div style={{ borderBottom: "1px solid #ccc", marginBottom: "20px" }}></div>
      
          <Row gutter={[16, 16]} style={{ paddingBottom: "20px" }}>
            <Col span={12}>
              <Text strong style={{ fontSize: "14px" }}>Contact Information</Text>
              <p style={{ fontSize: "14px" }}>Alex Driver</p>
              <p style={{ fontSize: "14px" }}>ExampleAdress@gmail.com</p>
              <div style={{ marginTop: "30px" }}>
                <a href="#" style={{ fontSize: "14px", color: "#1890ff", textDecoration: "underline", cursor: "pointer" }} 
                   onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                   onMouseOut={(e) => e.target.style.color = "#1890ff"}>Edit</a> | 
                <a href="#" style={{ fontSize: "14px", color: "#1890ff", textDecoration: "underline", cursor: "pointer", marginLeft: "8px" }} 
                   onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                   onMouseOut={(e) => e.target.style.color = "#1890ff"}>Change Password</a>
              </div>
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: "14px" }}>Newsletters</Text>
              <p style={{ fontSize: "14px" }}>You don’t subscribe to our newsletter.</p>
              <div style={{ marginTop: "60px" }}>
                <a href="#" style={{ fontSize: "14px", color: "#1890ff", textDecoration: "underline", cursor: "pointer" }} 
                   onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                   onMouseOut={(e) => e.target.style.color = "#1890ff"}>Edit</a>
              </div>
            </Col>
          </Row>
      
          <div style={{ marginTop: "40px" }}></div>
      
          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col span={24}>
              <Title level={4} style={{ display: "inline-block", marginBottom: "0px"}}>
                Address Book
              </Title>
              <a href="#" style={{ fontSize: "14px", marginLeft: "10px", color: "#1890ff", textDecoration: "underline", cursor: "pointer" }} 
                 onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                 onMouseOut={(e) => e.target.style.color = "#1890ff"}>Manage Addresses</a>
            </Col>
          </Row>
      
          <div style={{ borderBottom: "1px solid #ccc", marginTop: "10px", marginBottom: "10px" }}></div>
      
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong style={{ fontSize: "14px" }}>Default Billing Address</Text>
              <p style={{ fontSize: "14px" }}>You have not set a default billing address.</p>
              <div style={{ marginTop: "40px" }}>
                <a href="#" style={{ fontSize: "14px", color: "#1890ff", textDecoration: "underline", cursor: "pointer" }} 
                   onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                   onMouseOut={(e) => e.target.style.color = "#1890ff"}>Edit Address</a>
              </div>
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: "14px" }}>Default Shipping Address</Text>
              <p style={{ fontSize: "14px" }}>You have not set a default shipping address.</p>
              <div style={{ marginTop: "40px" }}>
                <a href="#" style={{ fontSize: "14px", color: "#1890ff", textDecoration: "underline", cursor: "pointer" }} 
                   onMouseOver={(e) => e.target.style.color = "#0056b3"} 
                   onMouseOut={(e) => e.target.style.color = "#1890ff"}>Edit Address</a>
              </div>
            </Col>
          </Row>
        </div>
      ),
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
      content: <Text>No orders found.</Text>,
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
      <Content className="responsive-padding" style={{ backgroundColor: "#fff" }}>
        <Breadcrumb separator=">" style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>My Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={2}>My Dashboard</Title>
        <Row gutter={16}>
        <Sidebar span={5}>
          <StyledTabs activeKey={selectedTab} onChange={setSelectedTab} tabPosition="left">
            {tabs.map((tab) => (
              <Tabs.TabPane tab={tab.label} key={tab.key} />
            ))}
          </StyledTabs>

          <div style={{ background: "#e9ecef", padding: "10px 20px 20px 20px", marginTop: "20px", textAlign: "center", width: "100%" }}>
            <Text strong style={{ fontSize: "16px", display: "block", marginTop: "12px", paddingBottom: "8px" }}>Compare Products</Text>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>You have no items to compare.</p>
          </div>

          <div style={{ background: "#e9ecef", padding: "10px 20px 20px 20px", marginTop: "20px", textAlign: "center", width: "100%", position: "relative" }}>
            <Text strong style={{ fontSize: "16px", display: "block", marginTop: "12px", paddingBottom: "8px" }}>My Wish List</Text>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>You have no items in your wish list.</p>
          </div>

        </Sidebar>
          
          <Col span={14}>
            {tabs.find((tab) => tab.key === selectedTab)?.content}
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerPage;
