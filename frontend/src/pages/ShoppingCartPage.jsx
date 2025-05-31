import { useEffect, useState } from "react";
import { QRPay, BanksObject } from 'vietnam-qr-pay';
import QRCode from "react-qr-code";
import {
  Row,
  Col,
  Typography,
  Button,
  Layout,
  Breadcrumb,
  Divider,
  Modal,
  notification,
} from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getAuth } from "firebase/auth";
import axios from "axios";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import ShoppingItemsTable from "../components/shopping_cart_page/ShoppingItemsTable";

const PayOnlineButton = styled(Button)`
  background-color: #ff3b30;
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  height: 50px;
  border-radius: 9999px;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0053b3;
    color: #fff;
    cursor: pointer;
  }
`;

const { Content } = Layout;
const { Text, Title } = Typography;

//Hàm format tiền
const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const showPaymentSuccess = () => {
  notification.success({
    message: "Payment Successful",
    description: (
      <span>
        Thank you for your payment! Your order is being processed.{" "}
        <a href="/customer/orders" style={{ fontWeight: "bold" }}>
          View your orders
        </a>
        .
      </span>
    ),
    placement: "topRight",
    duration: 5,
  });
};



const contentStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
};


const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const finalPrice = Math.round(50000 + 1.15 * totalPrice);

  const handlePay = () => {
    const momoPay = QRPay.initVietQR({
      bankBin: BanksObject.tpbank.bin,
      bankNumber: "07537430201",
      amount: finalPrice.toString(),
    });
    
    const content = momoPay.build();
    console.log("MoMo QR Content:", content);
    setQrUrl(content);
    setQrModalVisible(true);
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("User not signed in.");
          return;
        }

        const token = await user.getIdToken();

        const response = await axios.get("http://localhost:8000/cart/view", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const cartData = response.data; // e.g., { "1": 2, "5": 1 }

        // You probably need to fetch product details for these IDs
        const productDetails = await Promise.all(
          Object.entries(cartData).map(async ([id, quantity]) => {
            const res = await axios.get(
              `http://localhost:8000/laptops/id/${id}`,
            );
            return {
              ...res.data, // Product info
              quantity,
            };
          }),
        );

        setCartItems(productDetails);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && qrModalVisible) {
        setQrModalVisible(false);
        showPaymentSuccess();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [qrModalVisible]);


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
              <ShoppingItemsTable
                setTotalPrice={setTotalPrice}
                cartItems={cartItems}
              />
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
                  {formatPrice(finalPrice)}
                </span>
              </Title>
              <Button
                type="primary"
                block
                size="large"
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  height: "50px",
                  borderRadius: "9999px",
                }}
              >
                Pay on Delivery
              </Button>

              <PayOnlineButton block size="large" style={{ marginTop: "10px" }} onClick={handlePay}
              >
                Pay with E-Banking
              </PayOnlineButton>

              <Modal
                title="Scan to Pay"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={null}
                centered
              >
                {qrUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <QRCode value={qrUrl} size={220} />
                    <p style={{ marginTop: '10px' }}>Use any app to scan and pay</p>
                  </div>
                ) : (
                  <p>Generating QR code...</p>
                )}
              </Modal>


            </div>
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default ShoppingCartPage;
