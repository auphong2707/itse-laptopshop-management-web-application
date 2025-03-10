import React, { useState } from 'react';
import { Row, Col, Form, Typography, Input, Layout, Button, Breadcrumb, Steps, Divider } from 'antd';
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from './components/WebsiteFooter';

const { Content } = Layout;
const { Title } = Typography;

const contentStyle = {
    backgroundColor: "white",
    padding: "2rem",
};

const description = '\u00A0';

const CustomerLoginPage = () => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);

  const handleSignIn = async (values) => {
    console.log("Sign-in form values:", values);
  };

  const nextStep = async () => {
    try {
      await form.validateFields(); // Kiểm tra tất cả các trường trước khi cho phép chuyển bước
      setCurrent(current + 1);
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
    }
  };

  return (
    <Layout>
      <WebsiteHeader />
      <Content className="responsive-padding" style={contentStyle}>
        <Breadcrumb className="responsive-padding" separator=">" style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Sign Up</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={1} className="responsive-padding" style={{ marginBottom: "2rem" }}>
          Sign up
        </Title>

        <Title level={3} className="responsive-padding">
          {current === 0 ? "Information" : "Set up password"}
        </Title>

        <div className="responsive-padding">
          <Divider style={{ borderWidth: 1 }} />
        </div>

        <Row gutter={32}>
          <Col xs={24} md={{ span: 14, offset: 3 }}> 
            <Form layout="vertical" form={form} onFinish={handleSignIn}>
              {current === 0 && (
                <>
                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem"}}>First Name <span style={{ color: "red" }}>*</span></span>}
                    name="firstName"
                    rules={[{ required: true, message: "Please enter your first name." }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your first name" autoComplete="given-name" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Last Name <span style={{ color: "red" }}>*</span></span>}
                    name="lastName"
                    rules={[{ required: true, message: "Please enter your last name." }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your last name" autoComplete="family-name" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Phone Number <span style={{ color: "red" }}>*</span></span>}
                    name="phoneNumber"
                    rules={[{ required: true, message: "Please enter phone number" }, { pattern: /^\d+$/, message: "Invalid phone number" }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your phone number" autoComplete="tel" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Email <span style={{ color: "red" }}>*</span></span>}
                    name="email"
                    rules={[{ required: true, message: "Please enter your email." }, { type: "email", message: "Please enter a valid email." }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your email" autoComplete="email" />
                  </Form.Item>  

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Company</span>}
                    name="company"
                  >
                    <Input placeholder="Enter your company name" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Address</span>}
                    name="address"
                  >
                    <Input placeholder="Enter your address" />
                  </Form.Item>                              

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Country<span style={{ color: "red" }}>*</span></span>}
                    name="country"
                    rules={[{ required: true, message: "Please enter your country" }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your country" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Zip/Postal code <span style={{ color: "red" }}>*</span></span>}
                    name="zipPostalCode"
                    rules={[{ required: true, message: "Please enter your zip/postal code" }]}
                    required = {false}
                  >
                    <Input placeholder="Enter your zip/postal code" />
                  </Form.Item>

                  <Form.Item style={{ marginTop: "50px" }}>
                    <Button
                      type="primary" 
                      onClick={nextStep}
                      style={{ padding: "1rem 2rem", borderRadius: "25px", fontSize: "1rem", fontWeight: "bold" }}
                    >
                      Next
                    </Button>
                  </Form.Item>
                </>
              )}

              {current === 1 && (
                <>
                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem"  }}>Password <span style={{ color: "red" }}>*</span></span>}
                    name="password"
                    rules={[{ required: true, message: "Please enter your password." }]}
                    required = {false}
                  >
                    <Input.Password placeholder="Enter your password" autoComplete="new-password" />
                  </Form.Item>
                  
                  <Form.Item
                    label={<span style={{ fontWeight: "bold", fontSize: "1.1rem"  }}>Confirm Password <span style={{ color: "red" }}>*</span></span>}
                    name="confirmPassword"
                    rules={[
                      { required: true, message: "Please confirm your password." },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Passwords do not match!"));
                        },
                      }),
                    ]}
                    required = {false}
                  >
                    <Input.Password placeholder="Enter your password" autoComplete="new-password" />
                  </Form.Item>

                  <Form.Item style={{ marginTop: "50px" }}>
                    <Button
                      type="primary" 
                      htmlType="submit"
                      style={{ padding: "1rem 2rem", borderRadius: "25px", fontSize: "1rem", fontWeight: "bold" }}
                    >
                      Finish
                    </Button>
                  </Form.Item>                  
                </>
              )}
            </Form>
          </Col>

          <Col xs={24} md={6} style={{ paddingLeft: "5%" }}>
            <Steps
              current={current}
              onChange={(value) => {
                if (value > current) {
                  nextStep();
                } else {
                  setCurrent(value);
                }
              }}
              direction="vertical"
              items={[{ title: 'Information', description }, { title: 'Set up password', description }]}
              style={{ marginBottom: "2rem" }}
            />
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default CustomerLoginPage;