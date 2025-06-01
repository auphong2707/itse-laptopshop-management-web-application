import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Layout,
  Breadcrumb,
  Divider,
  notification,
} from "antd";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import ShoppingItemsTable from "../components/shopping_cart_page/ShoppingItemsTable";

const { Content } = Layout;
const { Text, Title } = Typography;

const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const contentStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
};

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const shippingFee = cartItems.length > 0 ? 50000 : 0;
  const finalPrice = Math.round(shippingFee + totalPrice);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      notification.error({
        message: "Cannot place order",
        description: "You must have at least one item in your cart to place an order.",
      });
    } else {
      window.location.href = "/customer/place-order/";
    }
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
              
              {cartItems.length > 0 && (
                <>
                  <Divider style={{ marginTop: "15px", marginBottom: "20px" }} />
                  <Text strong>Subtotal</Text>
                  <Text style={{ float: "right" }}>{formatPrice(totalPrice)}</Text>
                  <br />

                  <Text strong>Shipping</Text>
                  <Text style={{ float: "right" }}>{formatPrice(shippingFee)}</Text>
                  <br />
                  <br />
                </>
              )}

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
                  backgroundColor: "#1890ff",
                }}
                onClick={handlePlaceOrder}
              >
                Place Order
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
