import React from 'react';
import { Row, Col, Form, Typography, Input, Button, Layout, Space, Breadcrumb, Divider } from 'antd';
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from './components/WebsiteFooter';
import ShoppingItemsTable from './components/ShoppingItemsTable';
import { PayCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Text, Link, Title } = Typography;

const contentStyle = {
    backgroundColor: "#fff",
    padding: "2rem",
  };
  
const ShoppingCartPage = () => {
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
          <Breadcrumb.Item>Shopping Cart</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={2} className="responsive-padding" style={{ marginBottom: "2rem" }}>
          Shopping Cart
        </Title>
        <div className="responsive-padding">
          <Divider style={{ borderWidth: 1} } />
        </div>
        <Row gutter={[32, 32]} justify="center">
          {/* Left Box */}
          <Col xs={24} md={12} style={{ paddingLeft: "17px", paddingRight:"4px"}}>
            <div style={{padding: "0px 0"}}> 
              <ShoppingItemsTable/>
            </div> 

          </Col>
          {/* Right Box */}
          <Col xs={24} md={7} style={{ paddingLeft:"4px", paddingRight: "38px"}}>
            <div style={{ background: '#F5F7FF', padding: '20px', minHeight: '200px' }}>
              <Title level={3}>Summary</Title>
              <Divider />
              <Text strong>Subtotal</Text>
              <Text style={{ float: 'right' }}>$13,047.00</Text>
              <br />
              <Text strong>Shipping</Text>
              <Text style={{ float: 'right' }}>$21.00</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                (Standard Rate - Price may vary depending on the item/destination. TECS Staff will contact you.)
              </Text>
              <br />
              <Text strong>Tax</Text>
              <Text style={{ float: 'right' }}>$1.91</Text>
              <br />
              <Text strong>GST (10%)</Text>
              <Text style={{ float: 'right' }}>$1.91</Text>
              <Divider />
              <Title level={3}>
                Order Total: <span style={{ float: 'right' }}>$13,068.00</span>
              </Title>
              <Button type="primary" block style={{ marginTop: '10px' }}>
                Proceed to Checkout
              </Button>
              <Button icon={<PayCircleOutlined />} block style={{ marginTop: '10px', background: '#FFCC00', color: '#000' }}>
                Check out with PayPal
              </Button>
              <Button block disabled style={{ marginTop: '10px' }}>
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
  
export default ShoppingCartPage