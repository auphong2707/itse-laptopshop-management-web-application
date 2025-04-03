import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Typography,
  Input,
  Button,
  Layout,
  Breadcrumb,
  Alert,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

const { Content } = Layout;
const { Text, Title } = Typography;

const contentStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
};

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log("User:", user);

    // Get the Firebase Auth ID token
    const token = await user.getIdToken();

    // Send token to FastAPI backend
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Backend response:", data);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

const CustomerLoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const handleSignIn = async (values) => {
    const { email, password } = values;

    try {
      setLoginError(""); // clear any previous error
      await login(email, password);
      navigate("/"); // redirect to home
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password.");
    }
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
            <Link to="/customer/login">Login</Link>
          </Breadcrumb.Item>
        </Breadcrumb>

        <Title
          level={2}
          className="responsive-padding"
          style={{ marginBottom: "2rem" }}
        >
          Customer Login
        </Title>

        <Row gutter={[32, 32]} justify="center">
          {/* Left Box: Registered Customers */}
          <Col xs={24} md={8}>
            <div
              style={{
                background: "#F8F9FF",
                padding: "0.5rem 2rem 2rem 2rem",
                borderRadius: "8px",
              }}
            >
              <Title level={4}>Registered Customers</Title>
              <Text>
                If you have an account, sign in with your email address.
              </Text>

              <Form
                form={form}
                name="loginForm"
                onFinish={handleSignIn}
                layout="vertical"
                style={{ marginTop: "1rem" }}
                requiredMark={false}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>
                      Email <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email." },
                    { type: "email", message: "Please enter a valid email." },
                  ]}
                >
                  <Input placeholder="Your Name" />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>
                      Password <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password." },
                  ]}
                >
                  <Input.Password placeholder="Your Name" />
                </Form.Item>

                {loginError && (
                  <Form.Item>
                    <Alert
                      message={loginError}
                      type="error"
                      showIcon
                      style={{ marginBottom: "1rem", borderRadius: "8px" }}
                    />
                  </Form.Item>
                )}

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      padding: "1rem 2rem",
                      borderRadius: "25px",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    Sign In
                  </Button>
                  <Link
                    href="#"
                    style={{ marginLeft: "1rem", fontSize: "0.9rem" }}
                  >
                    Forgot Your Password?
                  </Link>
                </Form.Item>
              </Form>
            </div>
          </Col>

          {/* Right Box: New Customer */}
          <Col xs={24} md={8}>
            <div
              style={{
                background: "#F8F9FF",
                padding: "0.5rem 2rem 2rem 2rem",
                borderRadius: "8px",
                height: "100%",
              }}
            >
              <Title level={4}>New Customer?</Title>

              <Text>Creating an account has many benefits:</Text>

              <ul style={{ paddingInlineStart: "20px", margin: "1rem 0" }}>
                <li>Check out faster</li>
                <li>Keep more than one address</li>
                <li>Track orders and more</li>
              </ul>

              <Button
                type="primary"
                style={{
                  padding: "1rem 2rem",
                  borderRadius: "25px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
                onClick={() => navigate("/register")}
              >
                Create An Account
              </Button>
            </div>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerLoginPage;
