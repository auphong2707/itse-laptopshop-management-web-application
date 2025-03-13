import React from 'react';
import { Row, Col, Form, Typography, Input, Button, Layout, Breadcrumb } from 'antd';
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from './components/WebsiteFooter';

const { Content } = Layout;
const { Text, Link, Title } = Typography;

const contentStyle = {
    backgroundColor: "#fff",
    padding: "2rem",
  };
  
const CustomerLoginPage = () => {
  const [form] = Form.useForm();

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
        
        <Breadcrumb className="responsive-padding" separator=">" style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Login</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="responsive-padding" style={{ marginBottom: "2rem" }}>
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
                hideRequiredMark
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

                <Form.Item>
                  <Button
                   type="primary" 
                   htmlType="submit"
                   style={{
                    padding: "1rem 2rem",  
                    borderRadius: "25px",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}>
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
              }}>
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