import React from 'react';
import { Layout, Image } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const { Content } = Layout;

const images = [
  "None",
  "None",
  "None",
]

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
};

const ImageGallery = () => {
  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        style={{ height: "300px", backgroundColor: "white" }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <Image
              src={img}
              height="100%"
              width="100%"
              preview={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

const HomePage = () => {
  return (
    <Layout>
      {/* Header */}
      <WebsiteHeader />

      {/* Main Content */}
      <Content className='responsive-padding' style={contentStyle}>
        <ImageGallery />
      </Content>

      {/* Footer */}

    </Layout>
  );
}

export default HomePage;