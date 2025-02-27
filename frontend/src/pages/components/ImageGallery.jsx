import React from "react";
import { Carousel, Image } from "antd";
import PropTypes from "prop-types";

const ImageGallery = ({ imageSources }) => {
  return (
    <div style={{ height: "300px", width: "100%", backgroundColor: "black" }}>
      <Carousel autoplay autoplaySpeed={5000} dots={{ className: "custom-carousel-dots" }} arrows={true}>
        {imageSources.map((img, index) => (
          <Image
            src={img}
            preview={false}
            style={{ objectFit: "contain", height: "300px" }}
            height={300}
            width={"100%"}
          />
        ))}
      </Carousel>
    </div>
  );
};

ImageGallery.propTypes = {
  imageSources: PropTypes.arrayOf(PropTypes.string),
};

export default ImageGallery;
