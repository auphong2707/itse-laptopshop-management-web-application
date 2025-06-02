import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { QRPay, BanksObject } from 'vietnam-qr-pay';
import QRCode from "react-qr-code";
import { Button, Form, Layout, Modal, notification, Typography, Table, Spin, Input, Divider } from "antd";

import axios from "axios";
import { getAuth } from "firebase/auth";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";

const { Content } = Layout;
const { Text, Title } = Typography;

const contentStyle = {
  color: "#fff",
  backgroundColor: "white",
};

const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const showPaymentSuccess = () => {
  notification.success({
    message: "Payment Successful",
    description: (
      <span>
        Thank you for your payment! Your order is being processed.{' '}
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

const PlaceOrderPage = () => {
  const location = useLocation();

  const [cartOrder, setCartOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [confirmEbankingPayment, setConfirmEbankingPayment] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form] = Form.useForm();

  const fetchCartOrder = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();

      const cartResponse = await axios.get("http://localhost:8000/cart/view", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = cartResponse.data;

      const productFetches = Object.keys(cartData).map((id) =>
        axios.get(`http://localhost:8000/laptops/id/${id}`)
      );
      const productResponses = await Promise.all(productFetches);

      const itemsWithDetails = productResponses.map((res) => {
        const product = res.data;
        const quantity = cartData[product.id];
        const imageUrls = JSON.parse(product.product_image_mini || "[]");
        const image = imageUrls.length > 0 ? `http://localhost:8000${imageUrls[0]}` : "/default-image.jpg";
        const subtotal = product.sale_price * quantity;

        return {
          product_id: product.id,
          product_name: product.name,
          price_at_purchase: product.sale_price,
          quantity,
          image,
          subtotal,
        };
      });

      const totalPrice = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

      const fakeOrder = {
        id: "N/A",
        total_price: totalPrice,
        status: "Pending Payment",
        created_at: new Date().toISOString(),
        items: itemsWithDetails,
      };

      setCartOrder(fakeOrder);
    } catch (err) {
      console.error("Error loading cart-based order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (paymentMethod) => {
    try {
      const values = await form.validateFields();

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const authToken = await user.getIdToken();

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        user_email: values.email,
        shipping_address: values.address,
        phone_number: values.phone_number,
        payment_method: paymentMethod,
      };

      const res = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create order.");
      }

      const order = await res.json();
      notification.success({
        message: "Order Created",
        description: (
          <span>
            Your order has been placed.{' '}
            <a href="/customer/orders" style={{ fontWeight: "bold" }}>
              View orders
            </a>
          </span>
        ),
      });
    } catch (err) {
      console.error(err);
      notification.error({ message: "Order Error", description: err.message });
    }
  };

  const handlePayOnDelivery = (order) => {
    handleOrderSubmit("delivery");
  };

  const handleEBanking = (order) => {
    const amount = Math.round(order.total_price + 50000);
    const momoPay = QRPay.initVietQR({
      bankBin: BanksObject.tpbank.bin,
      bankNumber: "07537430201",
      amount: amount.toString(),
    });
    const content = momoPay.build();
    setQrUrl(content);
    setQrModalVisible(true);

    setConfirmEbankingPayment(true);
  };

  useEffect(() => {
    if (location.state?.cartOrder) {
      setCartOrder(location.state.cartOrder);
      setLoading(false);
    } else {
      fetchCartOrder();
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await axios.get("http://localhost:8000/accounts/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && qrModalVisible) {
        setQrModalVisible(false);
        showPaymentSuccess();

        if (confirmEbankingPayment) {
          setConfirmEbankingPayment(false);
          handleOrderSubmit("e-banking");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [qrModalVisible, confirmEbankingPayment]);


  useEffect(() => {
    if (editedProfile) {
      form.setFieldsValue({
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        email: editedProfile.email,
        phone_number: editedProfile.phone_number,
        address: editedProfile.address,
      });
    }
  }, [editedProfile]);

  const customerInfoSection = (
    <div style={{ width: "100%", marginBottom: 32 }}>
      <Form
        layout="horizontal"
        form={form}
        labelCol={{ span: 3 }}
        labelAlign="left"
        colon={false}
        initialValues={{
          first_name: editedProfile?.first_name || '',
          last_name: editedProfile?.last_name || '',
          email: editedProfile?.email || '',
          phone_number: editedProfile?.phone_number || '',
          address: editedProfile?.address || '',
        }}
        onValuesChange={() => setEditing(true)}
      >
        <Title level={4}>Customer Information</Title>

        <br/>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>First Name</span>}
          name="first_name"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input
            style={{ width: "100%" }}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, first_name: e.target.value }))
            }
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Last Name</span>}
          name="last_name"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input
            style={{ width: "100%" }}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, last_name: e.target.value }))
            }
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Email</span>}
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            style={{ width: "100%" }}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Phone Number</span>}
          name="phone_number"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input
            style={{ width: "100%" }}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, phone_number: e.target.value }))
            }
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Shipping Address</span>}
          name="address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 3 }}
            style={{ width: "100%" }}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, address: e.target.value }))
            }
          />
        </Form.Item>
      </Form>
    </div>
  );


  const productSection = (
    <div>
      <Title level={4}>Products in Order</Title>
      <Table
        columns={[
          { title: "Image", dataIndex: "image", key: "image", render: (img) => <img src={img} alt="Product" width={60} />, align: "center" },
          { title: "Product Name", dataIndex: "product_name", key: "product_name", render: (name) => name.toUpperCase() },
          { title: "Quantity", dataIndex: "quantity", key: "quantity", align: "center" },
          { title: "Price at Purchase", dataIndex: "price_at_purchase", key: "price_at_purchase", render: formatPrice, align: "center" },
          { title: "Total", dataIndex: "subtotal", key: "subtotal", render: formatPrice, align: "center" },
        ]}
        dataSource={cartOrder?.items || []}
        rowKey="product_id"
        pagination={false}
      />
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Text strong>Total Price: {formatPrice(cartOrder?.total_price + 50000 || 0)}</Text>
      </div>
    </div>
  );

  return (
    <Layout>
      <WebsiteHeader />
      <Content className="responsive-padding" style={contentStyle}>
        <Title level={3}>Order Summary</Title>
        {loading ? (
          <Spin tip="Loading order..." />
        ) : cartOrder ? (
          <>
            {customerInfoSection}
            <Divider />
            {productSection}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 16 }}>
              <Button onClick={() => handlePayOnDelivery(cartOrder)} style={{ padding: "12px 24px", backgroundColor: "#1890ff", color: "white" }}>Pay on Delivery</Button>
              <Button onClick={() => handleEBanking(cartOrder)} style={{ padding: "12px 24px", backgroundColor: "#52c41a", color: "white" }}>Pay via E-Banking</Button>
              <Modal title="Scan to Pay" open={qrModalVisible} onCancel={() => setQrModalVisible(false)} footer={null} centered>
                {qrUrl ? (
                  <div style={{ textAlign: "center" }}>
                    <QRCode value={qrUrl} size={220} />
                    <p style={{ marginTop: "10px" }}>Use any banking app to scan and pay</p>
                  </div>
                ) : (
                  <p>Generating QR code...</p>
                )}
              </Modal>
            </div>
          </>
        ) : (
          <Text>No items found in cart.</Text>
        )}
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default PlaceOrderPage;
