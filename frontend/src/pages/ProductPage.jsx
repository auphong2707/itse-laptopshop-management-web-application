import React, { useState, useEffect } from "react";
import { data, Link, useParams } from "react-router-dom";
import { Layout, Typography, Breadcrumb, Table, Image } from "antd";
import PropTypes from "prop-types";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import ProductImage from "./components/ProductImage";
import ProductTabs from "./components/ProductTabs";
import Purchase from "./components/Purchase";
import SupportSection from "./components/SupportSection";
import ImageGallery from "./components/ImageGallery";

const { Content } = Layout;
const { Title, Text } = Typography;

const imageSources = [
  "/product_page_banner_1.png",
  "/product_page_banner_1.png",
  "/product_page_banner_1.png",
];

const ProductHeader = ({ title, series }) => (
  <>
    <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
      <Breadcrumb.Item>
        <Link to="/">Home</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to="/laptops/all">Laptops</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/laptops/${series?.toLowerCase()}`}>{series}</Link>
      </Breadcrumb.Item>
    </Breadcrumb>
    <Title level={2} style={{ fontWeight: "bold" }}>
      {title}
    </Title>
    <Text type="secondary" style={{ color: "#0156ff", cursor: "pointer" }}>
      Be the first to review this product
    </Text>
  </>
);

ProductHeader.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.string,
};

const ExtraInfo = ({ productId }) => (
  <div
    style={{
      marginTop: "2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      paddingBottom: "50px",
    }}
  >
    <Text style={{ fontWeight: "bold" }}>
      Have a Question?{" "}
      <Typography.Link href="#" style={{ textDecoration: "underline" }}>
        Contact Us
      </Typography.Link>
    </Text>
    <Text>VN-{productId}</Text>
  </div>
);

const AboutProduct = ({ title, series, description, id }) => (
  <div style={{ maxWidth: "80%", paddingLeft: "5.5%", paddingRight: "0%" }}>
    <ProductHeader title={title} series={series} />
    <p style={{ marginTop: "1rem", fontSize: "16px", lineHeight: "1.6" }}>
      {description}
    </p>
    <ExtraInfo productId={id} />
  </div>
);

const Specs = ({ data, id }) => (
  <div style={{ maxWidth: "80%", paddingLeft: "5.5%", paddingRight: "0%" }}>
    <ProductHeader title={data.name} series={data.brand} />
    <Table
      columns={[
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Details", dataIndex: "details", key: "details" },
      ]}
      dataSource={[
        { key: "1", category: "CPU", details: data.cpu },
        {
          key: "2",
          category: "RAM",
          details: `${data.ram_amount}GB (${data.ram_type})`,
        },
        {
          key: "3",
          category: "Storage",
          details: `${data.storage_amount}GB ${data.storage_type}`,
        },
        {
          key: "4",
          category: "Screen Size",
          details: `${data.screen_size} inches`,
        },
        {
          key: "5",
          category: "Screen Resolution",
          details: data.screen_resolution,
        },
        {
          key: "6",
          category: "Screen Refresh Rate",
          details: `${data.screen_refresh_rate}Hz`,
        },
        {
          key: "7",
          category: "Battery Capacity",
          details: `${data.battery_capacity}Wh (${data.battery_cells} cells)`,
        },
        { key: "8", category: "Graphics Card (VGA)", details: data.vga },
        { key: "9", category: "Operating System", details: data.default_os },
        { key: "10", category: "Weight", details: `${data.weight} kg` },
        { key: "11", category: "HDMI Ports", details: data.number_hdmi_ports },
        {
          key: "12",
          category: "USB-C Ports",
          details: data.number_usb_c_ports,
        },
        {
          key: "13",
          category: "USB-A Ports",
          details: data.number_usb_a_ports,
        },
        {
          key: "14",
          category: "Ethernet Ports",
          details: data.number_ethernet_ports,
        },
        {
          key: "15",
          category: "Audio Jacks",
          details: data.number_audio_jacks,
        },
        {
          key: "16",
          category: "Webcam Resolution",
          details: data.webcam_resolution,
        },
        { key: "17", category: "Width", details: `${data.width} cm` },
        { key: "18", category: "Depth", details: `${data.depth} cm` },
        { key: "19", category: "Height", details: `${data.height} cm` },
        { key: "20", category: "Warranty", details: `${data.warranty} months` },
      ]}
      pagination={false}
      bordered
    />
    <ExtraInfo productId={id} />
  </div>
);

const transformData = (data) => {
  return {
    ...data,
    name: data["name"].toUpperCase(),
    brand: data["brand"].toUpperCase(),
    cpu: data["cpu"] ? data["cpu"].toUpperCase() : "N/A",
    ram_type: data["ram_type"].toUpperCase(),
    storage_type: data["storage_type"].toUpperCase(),
    vga: data["vga"] ? data["vga"].toUpperCase() : "N/A",
    default_os: data["default_os"]
      ? data["default_os"]
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
      : "N/A",
    webcam_resolution: data["webcam_resolution"]
      ? data["webcam_resolution"].toUpperCase()
      : "N/A",
  };
};

const ProductPage = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState({});
  useEffect(() => {
    fetch(`http://localhost:8000/laptops/id/${id}`)
      .then((response) => response.json())
      .then((data) => transformData(data))
      .then((data) => setProductData(data));
  }, [id]);

  console.log(productData);

  return (
    <Layout>
      <WebsiteHeader />
      <Content
        className="responsive-padding"
        style={{
          backgroundColor: "#fff",
          padding: "0rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Purchase price={productData.sale_price} />
        {/* Left Side: Product Tabs */}
        <div style={{ width: "70%", paddingLeft: "7%" }}>
          <ProductTabs
            tabLabels={["About Product", "Specs"]}
            tabContents={[
              AboutProduct({
                title: productData["name"],
                series: productData["brand"],
                description: productData["description"],
                id: id,
              }),
              Specs({ data: productData, id: id }),
            ]}
          />
        </div>

        {/* Right Side: Product Image */}
        <ProductImage
          imageUrls={JSON.parse(productData.product_image_mini || "[]").map(
            (url) => `http://localhost:8000${url}`,
          )}
        />
      </Content>

      {/* Advertisement */}
      <ImageGallery imageSources={imageSources} height="600px" />

      <SupportSection />

      {/* Banner */}
      <Image
        src="/product_page_banner_2.png"
        width={"100%"}
        style={{ width: "100%", height: "auto" }}
        preview={false}
      />

      <WebsiteFooter />
    </Layout>
  );
};

export default ProductPage;
