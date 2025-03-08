import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { HeartOutlined, BarChartOutlined, MailOutlined } from "@ant-design/icons";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const imageSources = [
  "https://asset.msi.com/resize/image/global/product/product_5_20200430090514_5eaa244a51b97.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png",
  "https://example.com/image2.png",
  "https://example.com/image3.png",
];

const ProductImage = () => {
  return (
    <div style={{ 
      position: "absolute", 
      top: "100px",  
      right: "-10px", 
      textAlign: "center", 
      display: "inline-block", 
      padding: "20px", 
      maxWidth: "550px",
      marginTop: "4rem",
    }}>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000 }}
        style={{ height: "400px", backgroundColor: "white", paddingBottom: "20px" }}
      >
        {imageSources.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Product ${index + 1}`}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Icons Container */}
      <div style={{ position: "absolute", top: "30%", left: "10px", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "10px", zIndex: "1000" }}> 
        <IconButton icon={<HeartOutlined />} tooltip="Add to Wishlist" />
        <IconButton icon={<BarChartOutlined />} tooltip="Compare" />
        <IconButton icon={<MailOutlined />} tooltip="Send Inquiry" />
      </div>
    </div>
  );
};

// Icon Button Component
const IconButton = ({ icon, tooltip }) => {
  return (
    <div
      style={{
        width: "40px", 
        height: "40px", 
        borderRadius: "50%", 
        backgroundColor: "#f5f5f5", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        cursor: "pointer", 
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        transition: "background-color 0.3s ease, transform 0.2s ease",
      }}
      title={tooltip}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#ddd";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#f5f5f5";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {icon}
    </div>
  );
};

export default ProductImage;
