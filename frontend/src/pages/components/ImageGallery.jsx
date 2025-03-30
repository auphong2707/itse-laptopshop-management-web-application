import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ColorThief from "color-thief-browser";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import PropTypes from "prop-types";

const ImageGallery = ({ imageSources }) => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSources.length > 0) {
      extractColor(imageSources[0]); // Extract color for the first image
    }
  }, [imageSources]);

  const extractColor = async (imgSrc) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgSrc;

      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          if (img.complete) {
            const dominantColor = colorThief.getColor(img);
            setBgColor(`rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`);
          }
        } catch (error) {
          console.error("ColorThief error:", error);
        }
      };

      img.onerror = () => console.error("Failed to load image:", imgSrc);
    } catch (error) {
      console.error("extractColor error:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "auto",
        backgroundColor: bgColor,
        transition: "background-color 0.5s ease-in-out",
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        onSlideChange={(swiper) => extractColor(imageSources[swiper.activeIndex])}
        style={{ height: "300px" }}
      >
        {imageSources.map((img, index) => (
          <SwiperSlide key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              ref={index === 0 ? imageRef : null}
              src={img}
              height={300}
              width="100%"
              style={{ objectFit: "contain" }}
              alt={`Slide ${index + 1}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

ImageGallery.propTypes = {
  imageSources: PropTypes.arrayOf(PropTypes.string),
};

export default ImageGallery;
