import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Typography,
  Input,
  Layout,
  Button,
  Breadcrumb,
  Steps,
  Divider,
} from "antd";

const { TextArea } = Input;

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import { register, checkEmailExists, checkPhoneExists } from "../utils/authService";

const { Content } = Layout;
const { Title } = Typography;

const contentStyle = {
  backgroundColor: "white",
  padding: "2rem",
};

const description = "\u00A0";

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSignIn = async (values) => {
    console.log("Password step values:", values);

    const step1Data = JSON.parse(
      localStorage.getItem("register_step1") || "{}",
    );

    const normalizePhone = (phone) => {
      if (phone.startsWith("0")) {
        return "+84" + phone.slice(1);
      }
      return phone;
    };

    const userData = {
      email: step1Data.email,
      password: values.password,
      phone_number: normalizePhone(step1Data.phoneNumber),
      first_name: step1Data.firstName,
      last_name: step1Data.lastName,
      shipping_address: step1Data.address || "",
      role: "customer",
    };

    setIsLoading(true);

    try {
      const data = await register(userData);
      console.log("Registration successful:", data);

      localStorage.removeItem("register_step1");
      setCurrent(2); // Move to confirmation step
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      await form.validateFields(); // validate form client-side
      const values = form.getFieldsValue();

      const normalizePhone = (phone) => {
        if (phone.startsWith("0")) {
          return "+84" + phone.slice(1);
        }
        return phone;
      };

      // Check if email and phone already exist
      let hasError = false;

      try {
        const emailExists = await checkEmailExists(values.email);
        if (emailExists) {
          form.setFields([
            {
              name: "email",
              errors: ["Email already exists."],
            },
          ]);
          hasError = true;
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }

      try {
        const phoneExists = await checkPhoneExists(normalizePhone(values.phoneNumber));
        if (phoneExists) {
          form.setFields([
            {
              name: "phoneNumber",
              errors: ["Phone number already exists."],
            },
          ]);
          hasError = true;
        }
      } catch (error) {
        console.error("Error checking phone:", error);
      }

      if (hasError) return;

      // nếu không có lỗi, lưu vào localStorage và tiếp tục
      localStorage.setItem("register_step1", JSON.stringify(values));
      setCurrent(current + 1);
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
    }
  };

  return (
    <Layout>
      <WebsiteHeader />
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
            <Link to="/register">Sign Up</Link>
          </Breadcrumb.Item>
        </Breadcrumb>

        <Title
          level={1}
          className="responsive-padding"
          style={{ marginBottom: "2rem" }}
        >
          Sign up
        </Title>

        <div className="responsive-padding">
          <Divider style={{ borderWidth: 1 }} />
        </div>

        <Row gutter={32}>
          <Col
            xs={24}
            md={{ span: 14, offset: 3 }}
            style={{ paddingLeft: "5px" }}
          >
            <Form layout="vertical" form={form} onFinish={handleSignIn}>
              {current === 0 && (
                <>
                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.3rem" }}>
                        First Name <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name.",
                      },
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your first name"
                      autoComplete="given-name"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.3rem" }}>
                        Last Name <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name.",
                      },
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your last name"
                      autoComplete="given-name"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.3rem" }}>
                        Phone Number <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="phoneNumber"
                    rules={[
                      { required: true, message: "Please enter phone number" },
                      {
                        pattern: /^(\+84|0)[1-9][0-9]{8}$/,
                        message: "Invalid phone number",
                      },
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.3rem" }}>
                        Email <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email." },
                      { type: "email", message: "Please enter a valid email." },
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your email"
                      autoComplete="email"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontSize: "1.3rem" }}>Shipping Address</span>}
                    name="address"
                  >
                    <TextArea
                      size="large"
                      placeholder="Enter your shipping address (optional)"
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      style={{ fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginTop: "50px" }}>
                    <Button
                      type="primary"
                      onClick={nextStep}
                      style={{
                        padding: "1rem 2rem",
                        borderRadius: "25px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      Next
                    </Button>
                  </Form.Item>
                </>
              )}

              {current === 1 && (
                <>
                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.3rem" }}>
                        Password <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your password.",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters.",
                      },
                      {
                        max: 32,
                        message: "Password must be at most 32 characters.",
                      },
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      type="password"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "1.4rem" }}>
                        Confirm Password <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="confirmPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password.",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match!"),
                          );
                        },
                      }),
                    ]}
                    required={false}
                  >
                    <Input
                      size="large"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      type="password"
                      style={{ height: "50px", fontSize: "1.1rem" }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginTop: "50px" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading} // 👈 hiển thị loading
                      disabled={isLoading} // 👈 ngăn spam click
                      style={{
                        padding: "1rem 2rem",
                        borderRadius: "25px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {isLoading ? "Creating Account..." : "Finish"}
                    </Button>
                  </Form.Item>
                </>
              )}

              {current === 2 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <Title level={2} style={{ color: "green" }}>
                    🎉 Account Created Successfully! 🎉
                  </Title>
                  <p style={{ fontSize: "1.2rem" }}>
                    Your account has been created. You can now sign in using
                    your credentials.
                  </p>
                  <Link to="/customer/login">
                    <Button
                      type="primary"
                      size="large"
                      style={{ marginTop: "1rem" }}
                    >
                      Go to Login
                    </Button>
                  </Link>
                </div>
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
              items={[
                {
                  title: (
                    <span style={{ fontSize: "1.2rem" }}>Information</span>
                  ),
                  description,
                },
                {
                  title: (
                    <span style={{ fontSize: "1.2rem" }}>Set up password</span>
                  ),
                  description,
                },
              ]}
              style={{ marginBottom: "2rem", fontSize: "1.2rem" }}
            />
          </Col>
        </Row>
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default RegisterPage;
