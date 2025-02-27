import React from 'react';
import { Layout, Image } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import ImageGallery from "./components/ImageGallery";
import ProductSlider from './components/ProductSlider';
import { getRandomProductCardData } from "./components/ProductCard";

const { Content } = Layout;

const imageSources = [
  "None",
  "None",
  "None",
  "None",
  "None"
]

const productData = [];
for (let i = 0; i < 10; i++) {
  productData.push(getRandomProductCardData());
}

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
};

const HomePage = () => {
  return (
    <Layout>
      {/* Header */}
      <WebsiteHeader />

      {/* Main Content */}
      <Content className='responsive-padding' style={contentStyle}>
        <ImageGallery imageSources={imageSources} />

        <ProductSlider productData={productData} />
      </Content>

      {/* Footer */}

    </Layout>
  );
}

export default HomePage;