import { Button, Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import PropTypes from "prop-types";

const { Text, Paragraph } = Typography;

const TestimonialSlider = ({ testimonialData }) => {
  return (
    <div
      style={{
        background: "#F5F7FF",
        padding: "40px",
        borderRadius: "10px",
        position: "relative",
      }}
    >
      <Text
        style={{
          color: "black",
          fontSize: 90,
          position: "absolute",
          left: 100,
          top: 5,
        }}
        italic
        strong
      >
        &apos;&apos;
      </Text>
      <div style={{ marginLeft: "130px", marginRight: "80px" }}>
        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true, el: ".custom-pagination" }}
        >
          {testimonialData.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div
                style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  textAlign: "left",
                }}
              >
                <Paragraph style={{ fontSize: "19px", textAlign: "justify" }}>
                  {testimonial.testimonial}
                </Paragraph>
                <div
                  style={{
                    marginTop: "12px",
                    textAlign: "right",
                    color: "#333",
                    fontSize: "16px",
                  }}
                >
                  - {testimonial.author}
                </div>
              </div>

              <br></br>
              <br></br>
              <br></br>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Right-aligned pagination */}
      <div
        className="custom-pagination"
        style={{
          display: "flex",
          justifyContent: "right",
          paddingRight: "40px",
        }}
      ></div>

      <Button
        color="blue"
        variant="outlined"
        style={{
          position: "absolute",
          borderRadius: "20px",
          bottom: "30px",
          left: "100px",
          fontSize: "16px",
        }}
      >
        Leave Us A Review
      </Button>
    </div>
  );
};
TestimonialSlider.propTypes = {
  testimonialData: PropTypes.arrayOf(
    PropTypes.shape({
      testimonial: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default TestimonialSlider;
