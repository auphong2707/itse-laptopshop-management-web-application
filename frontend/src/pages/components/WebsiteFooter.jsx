import { Row, Col, Typography, Layout, Input, Button, message } from "antd";
import {
  CustomerServiceOutlined,
  UserOutlined,
  TagOutlined,
  FacebookOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import { useState, useRef } from "react";
const { Title, Text, Paragraph, Link } = Typography;
const { Footer } = Layout;

const API_URL = "http://localhost:8000/newsletter/subscribe";
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const features = [
  {
    icon: <CustomerServiceOutlined style={{ fontSize: 30, color: "white" }} />,
    title: "Product Support",
    description:
      "Up to 3 years on-site warranty available for your peace of mind.",
  },
  {
    icon: <UserOutlined style={{ fontSize: 30, color: "white" }} />,
    title: "Personal Account",
    description:
      "With big discounts, free delivery and a dedicated support specialist.",
  },
  {
    icon: <TagOutlined style={{ fontSize: 30, color: "white" }} />,
    title: "Amazing Savings",
    description:
      "Up to 70% off new Products, you can be sure of the best price.",
  },
];

const CustomInput = ({ value, onChange }) => {
  return (
    <div>
      <style>
        {`
          .custom-input::placeholder {
            color: grey !important;
            opacity: 1;
          }
        `}
      </style>

      <Input
        value={value}
        onChange={onChange}
        placeholder="Your Email"
        className="custom-input"
        style={{
          width: 400,
          height: 45,
          borderRadius: "5px",
          padding: "10px",
          backgroundColor: "black",
          borderColor: "white",
          fontSize: 20,
          color: "white",
        }}
      />
    </div>
  );
};

const footerStyle = {
  borderBottom: "1px solid #f0f0f0",
  height: "100px",
  display: "flex",
  flexDirection: "column",
  padding: "0px",
  margin: "0px",
  backgroundColor: "white",
};

const WebsiteFooter = () => {
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !isValidEmail(email)) {
      setMessageText("Please enter a valid email.");
      setIsError(true);
      return;
    }

    const currentEmail = email; // preserve before clearing
    setEmail(""); // instantly clear input

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: currentEmail }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessageText("Subscribed successfully!");
        setIsError(false);
      } else if (response.status === 400) {
        setMessageText(data.detail || "Email already subscribed");
        setIsError(true);
      } else {
        setMessageText("Something went wrong. Please try again.");
        setIsError(true);
      }
    } catch (error) {
      setMessageText("Unable to reach server. Please try again later.");
      setIsError(true);
    }
  };

  return (
    <Footer style={footerStyle}>
      <div
        style={{
          textAlign: "center",
          background: "#fff",
          paddingTop: 70,
          paddingBottom: 30,
          display: "flex",
          justifyContent: "space-evenly",
        }}
        className="responsive-padding"
      >
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: "#0156FF",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {feature.icon}
              </div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph style={{ width: "60%", fontSize: 16 }}>
                {feature.description}
              </Paragraph>
            </div>
          </Col>
        ))}
      </div>

      <div
        style={{
          background: "#000",
          color: "#fff",
          paddingTop: "15px",
          paddingBottom: "10px",
        }}
        className="responsive-padding"
      >
        {/* Newsletter Section */}
        <Row
          justify="space-between"
          align="bottom"
          style={{ marginBottom: 20 }}
        >
          <Col xs={24} md={12}>
            <Title level={1} style={{ color: "#fff" }}>
              Sign Up To Our Newsletter.
            </Title>
            <Text style={{ color: "#bbb", fontSize: 18 }}>
              Be the first to hear about the latest offers.
            </Text>
          </Col>
          <Col
            xs={24}
            md={12}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex" }}>
              <CustomInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSubscribe}
                style={{
                  borderRadius: 30,
                  height: 45,
                  width: 160,
                  marginLeft: 20,
                  backgroundColor: "#0156FF",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Subscribe
              </Button>
            </div>
            {/* ✅ Reserve space for message here */}
            <div style={{ minHeight: 24, marginTop: 10 }}>
              {messageText && (
                <Text
                  style={{
                    color: isError ? "#ff4d4f" : "#52c41a",
                    fontSize: 16,
                  }}
                >
                  {messageText}
                </Text>
              )}
            </div>
          </Col>
        </Row>

        <hr style={{ border: "0.5px solid #222" }} />

        {/* Footer Links */}
        <Row gutter={[40, 20]}>
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#fff" }}>
              Information
            </Title>
            <Text style={{ display: "block", color: "#bbb" }}>About Us</Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Privacy Policy
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>Contact Us</Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Newsletter Subscription
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#fff" }}>
              PC Parts
            </Title>
            <Text style={{ display: "block", color: "#bbb" }}>CPUs</Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Graphic Cards
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              RAM (Memory)
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Motherboards
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#fff" }}>
              Laptops
            </Title>
            <Text style={{ display: "block", color: "#bbb" }}>
              Everyday Use Notebooks
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Gaming Laptops
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Workstation Laptops
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#fff" }}>
              Address
            </Title>
            <Text style={{ display: "block", color: "#bbb" }}>
              Address: 1234 Street Adress City, 1234
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              Phone: (00) 1234 5678
            </Text>
            <Text style={{ display: "block", color: "#bbb" }}>
              E-mail:{" "}
              <Link href="mailto:shop@email.com" style={{ color: "#007BFF" }}>
                shop@email.com
              </Link>
            </Text>
          </Col>
        </Row>

        <hr style={{ border: "0.5px solid #222", marginTop: 40 }} />

        {/* Social Media & Copyright */}
        <Row justify="space-between" align="middle" style={{ marginTop: 10 }}>
          <Col>
            <FacebookOutlined
              style={{ fontSize: "20px", color: "#fff", marginRight: "10px" }}
            />
            <InstagramOutlined style={{ fontSize: "20px", color: "#fff" }} />
          </Col>
          <Col>
            <Text style={{ color: "#bbb" }}>Copyright © 2025 Veil</Text>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

export default WebsiteFooter;
