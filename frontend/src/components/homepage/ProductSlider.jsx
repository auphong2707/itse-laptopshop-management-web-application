// Swiper core and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import PropTypes from "prop-types";

import ProductCard from "../ProductCard";


const ProductSlider = ({ productData }) => {
  return (
    <Swiper
      modules={[Navigation]} // Use the Navigation module
      navigation // Enable navigation arrows
      slidesPerView="auto" // Number of slides visible at once
      centeredSlides={false} // Align slides to the left
      watchOverflow={true} // Prevent empty space when there are less than 3 slides
      slidesOffsetBefore={0} // Aligns slides to the left
      slidesOffsetAfter={0} // Ensures no unwanted right offset
    >
      {productData.map((product, index) => (
        <SwiperSlide key={index}>
          <ProductCard {...product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

ProductSlider.propTypes = {
  productData: PropTypes.arrayOf(PropTypes.object),
};

export default ProductSlider;
