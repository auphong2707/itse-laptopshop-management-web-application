import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import "swiper/css";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Layout,
  Typography,
  Breadcrumb,
  Tabs,
} from "antd";
import { Divider } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import AdminCatalog from "./components/AdminCatalog.jsx";
import RefundTable from "./components/RefundTable.jsx";

const { Content } = Layout;
const { Title } = Typography;

const sectionTitleStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  marginTop: "2rem",
};

const CustomDivider = ({ label }) => (
  <>
    <h3 style={sectionTitleStyle}>{label}</h3>
    <div style={{ width: "50%" }}>
      <Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
    </div>
  </>
);

const RequiredLabel = ({ label }) => (
  <span style={{ fontWeight: "bold" }}>
    {label}
    <span style={{ color: "red", marginLeft: 4 }}>*</span>
  </span>
);

const OptionalLabel = ({ label }) => (
  <span style={{ fontWeight: "bold" }}>{label}</span>
);

const transformFormData = (values) => {
  return {
    brand: values.brand || "",
    sub_brand: values.sub_brand || "",
    name: values.name || "",
    cpu: values.cpu || "",
    vga: values.vga || "",
    ram_amount: values.ram_amount ? parseInt(values.ram_amount, 10) : 0,
    ram_type: values.ram_type || "",
    storage_amount: values.storage_amount
      ? parseInt(values.storage_amount, 10)
      : 0,
    storage_type: values.storage_type || "",
    webcam_resolution: values.webcam_resolution || "",
    screen_size: values.screen_size ? parseFloat(values.screen_size) : 0,
    screen_resolution: values.screen_resolution || "",
    screen_refresh_rate: values.screen_refresh_rate
      ? parseInt(values.screen_refresh_rate, 10)
      : 0,
    screen_brightness: values.screen_brightness
      ? parseInt(values.screen_brightness, 10)
      : 0,
    battery_capacity: values.battery_capacity
      ? parseFloat(values.battery_capacity)
      : 0,
    battery_cells: values.battery_cells
      ? parseInt(values.battery_cells, 10)
      : 0,
    weight: values.weight ? parseFloat(values.weight) : 0,
    default_os: values.default_os || "",
    warranty: values.warranty ? parseInt(values.warranty, 10) : 0,
    width: values.width ? parseFloat(values.width) : 0,
    depth: values.depth ? parseFloat(values.depth) : 0,
    height: values.height ? parseFloat(values.height) : 0,
    number_usb_a_ports: values.number_usb_a_ports
      ? parseInt(values.number_usb_a_ports, 10)
      : 0,
    number_usb_c_ports: values.number_usb_c_ports
      ? parseInt(values.number_usb_c_ports, 10)
      : 0,
    number_hdmi_ports: values.number_hdmi_ports
      ? parseInt(values.number_hdmi_ports, 10)
      : 0,
    number_ethernet_ports: values.number_ethernet_ports
      ? parseInt(values.number_ethernet_ports, 10)
      : 0,
    number_audio_jacks: values.number_audio_jacks
      ? parseInt(values.number_audio_jacks, 10)
      : 0,
    product_image_mini: values.product_image_mini || "",
    quantity: values.quantity ? parseInt(values.quantity, 10) : 0,
    original_price: values.original_price
      ? parseInt(values.original_price, 10)
      : 0,
    sale_price: values.sale_price ? parseInt(values.sale_price, 10) : 0,
  };
};

const Detail = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const [productData, setProductData] = useState({});
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8000/laptops/id/${id}`)
        .then((response) => {
          setProductData(response.data);
          form.setFieldsValue(response.data);

          // Extract and parse product images
          let images = [];
          if (response.data.product_image_mini) {
            try {
              images = JSON.parse(response.data.product_image_mini || "[]").map(
                (url) => `http://localhost:8000${url}`,
              );
              console.log("Parsed images:", images);
            } catch (error) {
              console.error("Error parsing product images:", error);
              images = [];
            }
          }
          setPictures(images);
        })
        .catch(() => {
          setProductData({});
          form.resetFields();
          setPictures([]); // Clear pictures on error
        });
    } else {
      form.resetFields();
      setPictures([]); // Clear pictures when no ID
    }
  }, [id]);

  const handleAddPicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newPicture = URL.createObjectURL(file);
      setPictures((prev) => [...prev, newPicture]);
    }
  };

  const handleDeletePicture = (indexToDelete) => {
    setPictures((prevPictures) =>
      prevPictures.filter((_, index) => index !== indexToDelete),
    );
  };

  const handleSubmit = async (form) => {
    const formData = form.getFieldsValue();

    try {
      if (id) {
        // Update existing laptop
        await axios.put(`http://localhost:8000/laptops/${id}`, formData);
        console.log("Update Success");
      } else {
        const transformedData = transformFormData(formData);
        console.log(
          "Transformed Data:",
          JSON.stringify(transformedData, null, 2),
        );
        // Insert new laptop
        await axios.post("http://localhost:8000/laptops/", transformedData);
        console.log("Insert Success");
        form.resetFields();
      }
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  const inputStyle = { width: "40%" };

  return (
    <div style={{ padding: "0rem 0" }}>
      <Form
        layout="horizontal"
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        labelAlign="left"
        colon={false}
      >
        {/* Flex Container chính */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Phần bên trái: Form fields */}
          <div style={{ flex: 2 }}>
            {/* General Information */}
            <CustomDivider label="General Information" />
            <Form.Item label={<RequiredLabel label="Brand" />} name="brand">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item label={<RequiredLabel label="Name" />} name="name">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Operating System" />}
              name="default_os"
            >
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Warranty" />}
              name="warranty"
            >
              <Input style={inputStyle} />
            </Form.Item>

            {/* Performance */}
            <CustomDivider label="Performance" />
            <Form.Item label={<RequiredLabel label="CPU" />} name="cpu">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item label={<OptionalLabel label="GPU" />} name="vga">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="RAM Amount" />}
              name="ram_amount"
            >
              <InputNumber style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="RAM Type" />}
              name="ram_type"
            >
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Storage Amount" />}
              name="storage_amount"
            >
              <InputNumber style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Storage Type" />}
              name="storage_type"
            >
              <Input style={inputStyle} />
            </Form.Item>

            {/* Display */}
            <CustomDivider label="Display" />
            <Form.Item
              label={<RequiredLabel label="Size" />}
              name="screen_size"
            >
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Resolution" />}
              name="screen_resolution"
            >
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Refresh Rate" />}
              name="screen_refresh_rate"
            >
              <InputNumber style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Brightness" />}
              name="screen_brightness"
            >
              <InputNumber style={inputStyle} />
            </Form.Item>

            {/* Battery and Power */}
            <CustomDivider label="Battery and Power" />
            <Form.Item
              label={<RequiredLabel label="Battery Capacity" />}
              name="battery_capacity"
            >
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Battery Cells" />}
              name="battery_cells"
            >
              <Input style={inputStyle} />
            </Form.Item>

            {/* Physical Dimensions and Weight */}
            <CustomDivider label="Physical Dimensions and Weight" />
            <Form.Item label={<RequiredLabel label="Width" />} name="width">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item label={<RequiredLabel label="Depth" />} name="depth">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item label={<RequiredLabel label="Height" />} name="height">
              <Input style={inputStyle} />
            </Form.Item>
            <Form.Item label={<RequiredLabel label="Weight" />} name="weight">
              <Input style={inputStyle} />
            </Form.Item>

            {/* Connectivity and Ports */}
            <CustomDivider label="Connectivity and Ports" />
            <Form.Item
              label={<RequiredLabel label="USB-A Ports" />}
              name="number_usb_a_ports"
            >
              <InputNumber
                min={0}
                controls={true}
                style={{
                  width: "60px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  backgroundColor: "#d9d9d9",
                  padding: "4px",
                  textAlign: "center",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="USB-C Ports" />}
              name="number_usb_c_ports"
              rules={[{ required: false }]}
            >
              <InputNumber
                min={0}
                controls={true}
                style={{
                  width: "60px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  backgroundColor: "#d9d9d9",
                  padding: "4px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel label="HDMI Ports" />}
              name="number_hdmi_ports"
              rules={[{ required: false }]}
            >
              <InputNumber
                min={0}
                controls={true}
                style={{
                  width: "60px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  backgroundColor: "#d9d9d9",
                  padding: "4px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel label="Ethernet Ports" />}
              name="number_ethernet_ports"
              rules={[{ required: false }]}
            >
              <InputNumber
                min={0}
                controls={true}
                style={{
                  width: "60px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  backgroundColor: "#d9d9d9",
                  padding: "4px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel label="Audio Jacks" />}
              name="number_audio_jacks"
              rules={[{ required: false }]}
            >
              <InputNumber
                min={0}
                controls={true}
                style={{
                  width: "60px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  backgroundColor: "#d9d9d9",
                  padding: "4px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            {/* Other features */}
            <CustomDivider label="Other features" />
            <Form.Item
              label={<OptionalLabel label="Webcam" />}
              name="webcam_resolution"
            >
              <Input style={inputStyle} />
            </Form.Item>

            {/* Price */}
            <CustomDivider label="Retail information" />
            <Form.Item
              label={<RequiredLabel label="Quantity" />}
              name="quantity"
            >
              <InputNumber style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel label="Original Price" />}
              name="original_price"
            >
              <InputNumber suffix="đ" style={inputStyle} />
            </Form.Item>
            <Form.Item
              label={<OptionalLabel label="Sales Price" />}
              name="sale_price"
            >
              <InputNumber suffix="đ" style={inputStyle} />
            </Form.Item>

            {/* Submit button */}
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button type="primary" onClick={() => handleSubmit(form)}>
                {id ? "Update Laptop" : "Add Laptop"}
              </Button>
            </Form.Item>
          </div>

          <div
            style={{
              position: "absolute",
              right: "215px",
              top: "325px",
              flex: 1,
            }}
          >
            <Form.Item name="pictures">
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={40}
                slidesPerView={1}
                style={{ width: "650px", height: "400px", padding: "1rem" }}
              >
                {pictures.map((picture, index) => (
                  <SwiperSlide
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src={picture}
                      alt={`Picture ${index + 1}`}
                      style={{ width: "600px", height: "400px" }}
                    />
                    <button
                      onClick={() => handleDeletePicture(index)}
                      style={{
                        position: "absolute",
                        top: "-12px",
                        right: "10px",
                        background: "#b0b0b0",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "red",
                        borderRadius: "50%",
                        width: "22px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#8a8a8a")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#b0b0b0")
                      }
                    >
                      <CloseOutlined />
                    </button>
                  </SwiperSlide>
                ))}
                {/* Add Picture Button */}
                <SwiperSlide
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      cursor: "pointer",
                      padding: "20px",
                      border: "2px dashed #aaa",
                      borderRadius: "8px",
                    }}
                  >
                    Add picture
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAddPicture}
                    />
                  </label>
                </SwiperSlide>
              </Swiper>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

const AdminTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveKey = () => {
    if (location.pathname.includes("/admin/catalog")) return "0";
    if (location.pathname.includes("/admin/detail")) return "1";
    if (location.pathname.includes("/admin/refund")) return "2";
    return "0";
  };

  const handleTabChange = (key) => {
    if (key === "0") navigate("/admin/catalog/all");
    if (key === "1") navigate("/admin/detail");
    if (key === "2") navigate("/admin/refund");
  };

  return (
    <div>
      <Tabs
        activeKey={getActiveKey()}
        onChange={handleTabChange}
        tabBarGutter={80}
        tabBarStyle={{ borderBottom: "none", paddingBottom: "1rem" }}
        style={{ width: "100%" }}
      >
        <Tabs.TabPane key="0" tab="All Products" />
        <Tabs.TabPane key="1" tab="Detail" />
        <Tabs.TabPane key="2" tab="Refund Request" />
      </Tabs>
    </div>
  );
};

const RefundRequest = () => {
  return (
    <div style={{ paddingTop: "2rem" }}>
      <RefundTable />
    </div>
  );
};

const AdministratorPage = () => {
  return (
    <Layout>
      <WebsiteHeader />

      <Content style={{ padding: "1.5rem 12%", backgroundColor: "#fff" }}>
        <Breadcrumb
          separator=">"
          style={{ marginBottom: "1rem", fontSize: "14px" }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Administrator Page</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} style={{ fontWeight: "bold" }}>
          Administrator Page
        </Title>

        {/* Tabs for Navigation */}
        <AdminTabs />

        {/* Outlet for Rendering Child Components */}
        <Outlet />
      </Content>

      <WebsiteFooter />
    </Layout>
  );
};

export default AdministratorPage;
export { Detail, AdminCatalog, RefundRequest };
