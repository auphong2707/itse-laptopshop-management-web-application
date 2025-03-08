import React from "react";
import { Layout, Typography, Breadcrumb, Table, Image} from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import ProductImage from "./components/ProductImage";
import ProductTabs from "./components/ProductTabs";
import Purchase from "./components/Purchase";
import SupportSection from "./components/SupportSection";
import ImageGallery from "./components/ImageGallery";

const { Content } = Layout;
const { Title, Text, Link } = Typography;

const imageSources = [
  "None",
  "None",
  "None",
]

const ProductHeader = ({ title, series }) => (
  <>
    <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
      <Breadcrumb.Item>Home</Breadcrumb.Item>
      <Breadcrumb.Item>Laptops</Breadcrumb.Item>
      <Breadcrumb.Item>{series}</Breadcrumb.Item>
    </Breadcrumb>
    <Title level={2} style={{ fontWeight: "bold" }}>{title}</Title>
    <Text type="secondary" style={{ color: "#0156ff", cursor: "pointer" }}>
      Be the first to review this product
    </Text>
  </>
);

const ExtraInfo = () => (
  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
    <Text style={{ fontWeight: "bold" }}>
      Have a Question? <Link href="#" style={{ textDecoration: "underline" }}>Contact Us</Link>
    </Text>
    <Text>SKU D5515AI</Text>
    <div style={{ fontWeight: "bold", cursor: "pointer", marginTop: "4rem", marginBottom: "8rem" ,width: "100%" }}>
      + MORE INFORMATION
    </div>
  </div>
);

const AboutProduct = () => (
  <div style={{ maxWidth: "60%", paddingLeft: "10%", paddingRight: "5%" }}>
    <ProductHeader title="MSI MPG Trident 3" series="MSI MPG Series" />
    <p style={{ marginTop: "1rem", fontSize: "16px", lineHeight: "1.6" }}>
    </p>
    <ExtraInfo />
  </div>
);

const Details = () => (
  <div style={{ maxWidth: "60%", paddingLeft: "10%", paddingRight: "5%" }}>
    <ProductHeader title="MSI MPG Trident 3" series="MSI MPG Series" />
    <ul style={{ marginTop: "1rem", fontSize: "16px", lineHeight: "1.8" }}>
      <li>Intel Core i7-10700F</li>
      <li>Intel H470</li>
      <li>WiFi 6</li>
      <li>NVIDIA MSI GeForce RTX 2080 SUPER 8GB GDDR6</li>
      <li>2x DDR4 Slots (64GB Max)</li>
      <li>512GB SSD (SATA) + 2TB HDD</li>
      <li>Gaming Keyboard & Mouse</li>
    </ul>
    <ExtraInfo />
  </div>
);

const Specs = () => (
  <div style={{ maxWidth: "60%", paddingLeft: "10%", paddingRight: "5%" }}>
    <ProductHeader title="MSI MPG Trident 3" series="MSI MPG Series" />
    <Table
      columns={[
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Details", dataIndex: "details", key: "details" }
      ]}
      dataSource={[
        { key: "1", category: "CPU", details: "Intel Core i7-10700F" },
        { key: "2", category: "RAM", details: "16GB DDR4" },
        { key: "3", category: "Storage", details: "512GB SSD + 2TB HDD" }
      ]}
      pagination={false}
      bordered
    />
    <ExtraInfo />
  </div>
);

const ProductPage = () => {
  return (
    <Layout>
      <WebsiteHeader />
      <Content className="responsive-padding" style={{ backgroundColor: "#fff", padding: "0rem " }}>
        <Purchase />
        <ProductImage />
        <ProductTabs
          tabLabels={["About Product", "Details", "Specs"]}
          tabContents={[
            AboutProduct(),
            Details(),
            Specs()
          ]}
        />
      </Content>

      {/* Advertisement */}
      <ImageGallery imageSources={imageSources} />

      <SupportSection />

        {/* Banner */}
        <Image
          src="None"
          width={"100%"}
          style={{ width: "100%", height: "400px" }}
          preview={false}
        />

      <WebsiteFooter />
    </Layout>
  );
};

export default ProductPage;
