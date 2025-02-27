import React from "react";
// Swiper core and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "./ProductCard";

import PropTypes from "prop-types";

const ProductSlider = ({productData}) => {
  return (
    <div>
      <Swiper
        modules={[Navigation]}      // Use the Navigation module
        navigation                 // Enable navigation arrows
        slidesPerView="auto"          // Number of slides visible at once
      >
        {productData.map((product, index) => (
          <SwiperSlide key={index}>
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

ProductSlider.propTypes = {
	productData: PropTypes.arrayOf(PropTypes.object),
};

export default ProductSlider;
