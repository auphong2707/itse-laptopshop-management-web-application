import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { HeartOutlined, BarChartOutlined, MailOutlined } from "@ant-design/icons";
import "swiper/css";
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
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "20px",
      paddingRight: "8rem",
      paddingTop: "-2rem",
    }}>
      
      {/* Icons Container */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: "10",
        position: "relative", 
        marginRight: "10px", 
        marginBottom: "300px",
      }}>
        <IconButton icon={<HeartOutlined />} tooltip="Add to Wishlist" />
        <IconButton icon={<BarChartOutlined />} tooltip="Compare" />
        <IconButton icon={<MailOutlined />} tooltip="Send Inquiry" />
      </div>

      {/* Swiper Image Gallery */}
      <div style={{ width: "400px", height: "450px", position: "relative" }}>
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000 }}
          style={{ height: "100%", width: "100%", backgroundColor: "white", marginTop: "-5rem" }}
        >
          {imageSources.map((img, index) => (
            <SwiperSlide key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src={img}
                alt={`Product ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
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
