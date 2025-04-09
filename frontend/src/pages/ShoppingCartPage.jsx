import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Typography,
  Input,
  Button,
  Layout,
  Space,
  Breadcrumb,
  Divider,
} from "antd";
import { Link } from "react-router-dom";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import ShoppingItemsTable from "./components/ShoppingItemsTable";
import styled from "styled-components";

const PaypalButton = styled(Button)`
  background-color: #ffcc00;
  color: #000;
  font-weight: bold;
  font-size: 16px;
  height: 50px;
  border-radius: 9999px;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e6b800;
    color: #000;
    cursor: pointer;
  }
`;

const { Content } = Layout;
const { Text, Title } = Typography;

//Hàm format tiền
const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const contentStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
};

const ShoppingCartPage = () => {
  const [form] = Form.useForm();
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSignIn = (values) => {
    // Handle sign-in logic here (e.g., call API)
    console.log("Sign-in form values:", values);
  };

  return (
    <Layout>
      {/* Header */}
      <WebsiteHeader />

      {/* Main Content */}
      <Content className="responsive-padding" style={contentStyle}>
        <Breadcrumb
          className="responsive-padding"
          separator=">"
          style={{ marginBottom: "1rem" }}
        >
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/shopping-cart">Shopping Cart</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Title
          level={2}
          className="responsive-padding"
          style={{ marginBottom: "2rem" }}
        >
          Shopping Cart
        </Title>
        <div className="responsive-padding">
          <Divider style={{ borderWidth: 1 }} />
        </div>
        <Row gutter={[32, 32]} justify="center">
          {/* Left Box */}
          <Col
            xs={24}
            md={12}
            style={{ paddingLeft: "23px", paddingRight: "4px" }}
          >
            <div style={{ padding: "0px 0" }}>
              <ShoppingItemsTable setTotalPrice={setTotalPrice} />
            </div>
          </Col>
          {/* Right Box */}
          <Col
            xs={24}
            md={7}
            style={{ paddingLeft: "4px", paddingRight: "41px" }}
          >
            <div
              style={{
                background: "#F5F7FF",
                padding: "20px",
                minHeight: "200px",
              }}
            >
              <Title level={3} style={{ margin: "0px 0" }}>
                Summary
              </Title>
              <Divider style={{ marginTop: "15px", marginBottom: "20px" }} />
              <Text strong>Subtotal</Text>
              <Text style={{ float: "right" }}>{formatPrice(totalPrice)}</Text>
              <br />
              <Text strong>Shipping</Text>
              <Text style={{ float: "right" }}>{formatPrice(50000)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                (Standard Rate - Price may vary depending on the
                item/destination. TECS Staff will contact you.)
              </Text>
              <br />
              <Text strong>Tax</Text>
              <Text style={{ float: "right" }}>
                {formatPrice(0.05 * totalPrice)}
              </Text>
              <br />
              <Text strong>GST (10%)</Text>
              <Text style={{ float: "right" }}>
                {formatPrice(0.1 * totalPrice)}
              </Text>
              <Divider style={{ marginBottom: "18px" }} />
              <Title level={3} style={{ marginTop: "12px" }}>
                Order Total:{" "}
                <span style={{ float: "right" }}>
                  {formatPrice(50000 + 1.15 * totalPrice)}
                </span>
              </Title>
              <Button
                type="primary"
                block
                size="large" // Tùy chọn: "large", "middle", "small"
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  fontSize: "16px", // Tăng cỡ chữ
                  height: "50px", // Chiều cao nút
                  borderRadius: "9999px", // Bo tròn mạnh
                }}
              >
                Proceed to Checkout
              </Button>

              <PaypalButton block size="large" style={{ marginTop: "8px" }}>
                Check out with PayPal
              </PaypalButton>

              <Button
                block
                disabled
                size="large"
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  height: "50px",
                  borderRadius: "9999px",
                }}
              >
                Check Out with Multiple Addresses
              </Button>
            </div>
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default ShoppingCartPage;
