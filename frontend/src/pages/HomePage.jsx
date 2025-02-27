import React from 'react';
import { Layout, Image } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import ImageGallery from "./components/ImageGallery";

const { Content } = Layout;

const imageSources = [
  "None",
  "None",
  "None",
  "None",
  "None"
]

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
      </Content>

      {/* Footer */}

    </Layout>
  );
}

export default HomePage;