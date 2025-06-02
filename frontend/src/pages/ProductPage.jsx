import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Layout, Typography, Breadcrumb, Table, Image, Rate, Modal, notification, List } from "antd";
import PropTypes from "prop-types";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import ProductImage from "../components/product_page/ProductImage";
import ProductTabs from "../components/product_page/ProductTabs";
import Purchase from "../components/product_page/Purchase";
import SupportSection from "../components/product_page/SupportSection";
import { useUser } from '../utils/UserContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const ProductHeader = ({ title, series }) => (
  <>
    <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
      <Breadcrumb.Item>
        <Link to="/">Home</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to="/laptops/all">Laptops</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/laptops/${series?.toLowerCase()}`}>{series}</Link>
      </Breadcrumb.Item>
    </Breadcrumb>
    <Title level={2} style={{ fontWeight: "bold" }}>
      {title}
    </Title>
    <Text type="secondary" style={{ color: "#0156ff", cursor: "pointer" }}>
      Be the first to review this product
    </Text>
  </>
);

ProductHeader.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.string,
};

const ExtraInfo = ({ productId }) => (
  <div
    style={{
      marginTop: "2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      paddingBottom: "50px",
    }}
  >
    <Text style={{ fontWeight: "bold" }}>
      Have a Question?{" "}
      <Typography.Link href="#" style={{ textDecoration: "underline" }}>
        Contact Us
      </Typography.Link>
    </Text>
    <Text>VN-{productId}</Text>
  </div>
);

ExtraInfo.propTypes = {
  productId: PropTypes.number.isRequired,
};

const AboutProduct = ({ title, series, description, id }) => (
  <div style={{ maxWidth: "80%", paddingLeft: "5.5%", paddingRight: "0%" }}>
    <ProductHeader title={title} series={series} />
    <p style={{ marginTop: "1rem", fontSize: "16px", lineHeight: "1.6" }}>
      {description}
    </p>
    <ExtraInfo productId={id} />
  </div>
);

AboutProduct.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.string,
  description: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};

const Specs = ({ data, id }) => (
  <div style={{ maxWidth: "80%", paddingLeft: "5.5%", paddingRight: "0%" }}>
    <ProductHeader title={data.name} series={data.brand} />
    <Table
      columns={[
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Details", dataIndex: "details", key: "details" },
      ]}
      dataSource={[
        { key: "1", category: "CPU", details: data.cpu },
        {
          key: "2",
          category: "RAM",
          details: `${data.ram_amount}GB (${data.ram_type})`,
        },
        {
          key: "3",
          category: "Storage",
          details: `${data.storage_amount}GB ${data.storage_type}`,
        },
        {
          key: "4",
          category: "Screen Size",
          details: `${data.screen_size} inches`,
        },
        {
          key: "5",
          category: "Screen Resolution",
          details: data.screen_resolution,
        },
        {
          key: "6",
          category: "Screen Refresh Rate",
          details: `${data.screen_refresh_rate}Hz`,
        },
        {
          key: "7",
          category: "Battery Capacity",
          details: `${data.battery_capacity}Wh (${data.battery_cells} cells)`,
        },
        { key: "8", category: "Graphics Card (VGA)", details: data.vga },
        { key: "9", category: "Operating System", details: data.default_os },
        { key: "10", category: "Weight", details: `${data.weight} kg` },
        { key: "11", category: "HDMI Ports", details: data.number_hdmi_ports },
        {
          key: "12",
          category: "USB-C Ports",
          details: data.number_usb_c_ports,
        },
        {
          key: "13",
          category: "USB-A Ports",
          details: data.number_usb_a_ports,
        },
        {
          key: "14",
          category: "Ethernet Ports",
          details: data.number_ethernet_ports,
        },
        {
          key: "15",
          category: "Audio Jacks",
          details: data.number_audio_jacks,
        },
        {
          key: "16",
          category: "Webcam Resolution",
          details: data.webcam_resolution,
        },
        { key: "17", category: "Width", details: `${data.width} cm` },
        { key: "18", category: "Depth", details: `${data.depth} cm` },
        { key: "19", category: "Height", details: `${data.height} cm` },
        { key: "20", category: "Warranty", details: `${data.warranty} months` },
      ]}
      pagination={false}
      bordered
    />
    <ExtraInfo productId={id} />
  </div>
);

Specs.propTypes = {
  data: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
};

const transformData = (data) => {
  return {
    ...data,
    name: data["name"] ? data["name"].toUpperCase() : "N/A",
    brand: data["brand"] ? data["brand"].toUpperCase() : "N/A",
    cpu: data["cpu"] ? data["cpu"].toUpperCase() : "N/A",
    ram_type: data["ram_type"] ? data["ram_type"].toUpperCase() : "N/A",
    storage_type: data["storage_type"] ? data["storage_type"].toUpperCase() : "N/A",
    vga: data["vga"] ? data["vga"].toUpperCase() : "N/A",
    default_os: data["default_os"]
      ? data["default_os"]
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
      : "N/A",
    webcam_resolution: data["webcam_resolution"]
      ? data["webcam_resolution"].toUpperCase()
      : "N/A",
  };
};

const ProductPage = () => {
  const navigate = useNavigate();

  const user = useUser();
  const { id } = useParams();
  const [productData, setProductData] = useState({});
  const [Reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/laptops/id/${id}`)
      .then((response) => response.json())
      .then((data) => transformData(data))
      .then((data) => setProductData(data));

    fetch(`http://localhost:8000/reviews/laptop/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        return response.json();
      })
      .then((data) => setReviews(data))
      .catch((error) => console.error('Error fetching reviews:', error));
  }, [id]);

  console.log("Reviews:", Reviews);
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const handleSubmitReview = async () => {
    if (!user) {
      Modal.confirm({
        title: "Login Required",
        content: "You must be logged in to access the shopping cart.",
        okText: "Go to Login",
        cancelText: "Cancel",
        onOk() {
          navigate("/customer/login");
        },
        onCancel() {},
      });
      return;
    }

    if (rating === 0 || reviewText.trim() === "") {
      notification.error({
        message: (
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Error
          </Text>
        ),
        description: (
          <Text style={{ fontSize: 20 }}>
            Please provide a rating and write a review before submitting.
          </Text>
        ),
        duration: 3,
        placement: "topRight",
        style: {
          fontSize: "16px",
          padding: "16px",
          width: "600px",
        },
      });
      return;
    }

    const review = {
      rating: rating,
      review_text: reviewText,
      laptop_id: parseInt(id),
    };

    try {
      const token = user.accessToken;

      const res = await fetch("http://localhost:8000/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(review),
      });

      if (res.ok) {
        notification.success({
          message: (
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              Success
            </Text>
          ),
          description: (
            <Text style={{ fontSize: 20 }}>
              Review submitted successfully!
            </Text>
          ),
          duration: 3,
          placement: "top",
          style: {
            fontSize: "16px",
            padding: "16px",
            width: "600px",
          },
        });
        // Reset form
        setRating(0);
        setReviewText("");
      } else {
        const errorData = await res.json();
          notification.error({
          message: (
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              Error
            </Text>
          ),
          description: (
            <Text style={{ fontSize: 20 }}>
              {errorData.detail || "Unable to submit review. Please try again later."}
            </Text>
          ),
          duration: 3,
          placement: "topRight",
          style: {
            fontSize: "16px",
            padding: "16px",
            width: "600px",
          },
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Something went wrong!");
    }
  };

  const imageUrl = JSON.parse(productData.product_image_mini || "[]")[0]
    ? `http://localhost:8000${JSON.parse(productData.product_image_mini)[0]}`
    : "/placeholder.png"; // fallback ảnh nếu không có

  return (
    <Layout>
      <WebsiteHeader />
      <Content
        className="responsive-padding"
        style={{
          backgroundColor: "#fff",
          padding: "0rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Purchase price={productData.sale_price} laptopId={id} />
        {/* Left Side: Product Tabs */}
        <div style={{ width: "70%", paddingLeft: "7%" }}>
          <ProductTabs
            tabLabels={["About Product", "Specs"]}
            tabContents={[
              AboutProduct({
                title: productData["name"],
                series: productData["brand"],
                description: productData["description"],
                id: id,
              }),
              Specs({ data: productData, id: id }),
            ]}
          />
        </div>

        {/* Right Side: Product Image */}
        <ProductImage
          imageUrls={JSON.parse(productData.product_image_mini || "[]").map(
            (url) => `http://localhost:8000${url}`
          )}
        />
      </Content>

      <div
        style={{
          padding: "2rem",
          width: "60%",
          alignSelf: "center",
        }}
      >
        <Title level={4} style={{ fontWeight: "bold", marginBottom: "1rem" }}>
          Customer Reviews
        </Title>
        <List
          itemLayout="vertical"
          dataSource={Reviews}
          pagination={{
            pageSize: 5,
            position: "bottom",
          }}
          renderItem={(review) => (
            <List.Item key={review.id}>
              <List.Item.Meta
                title={
                  <>
                    <Rate disabled defaultValue={review.rating} style={{ fontSize: "16px" }} />
                    <span style={{ marginLeft: "1rem" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </>
                }
              />
              <p>{review.review_text}</p>
            </List.Item>
          )}
        />
      </div>

      <div style={{ backgroundColor: "#ffffff", justifyContent: "center", display: "flex" }}>
        <div
          style={{
            padding: "2rem",
            width: "60%",
            alignSelf: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Title level={4} style={{ fontWeight: "bold", margin: 0 }}>
              SUBMIT REVIEWS AND RATINGS
            </Title>
          </div>
          <hr style={{ marginTop: "25px", marginBottom: "1.5rem" }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "24px",
            }}
          >
            <Image
              src={imageUrl}
              alt="Product"
              width={80}
              height={60}
              style={{ borderRadius: "4px" }}
              preview={false}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "0.25rem",
                  lineHeight: "1.4",
                }}
              >
                {productData.name || "PRODUCT’S NAME"}
              </Text>
              <Rate
                value={rating}
                onChange={setRating}
                style={{ fontSize: "24px" }}
              />
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Write your review..."
            style={{
              width: "100%",
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #000",
              borderRadius: "4px",
              fontSize: "16px",
              fontFamily: "sans-serif",
            }}
          />

          <button
            onClick={handleSubmitReview}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#4e6ef2",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              fontWeight: "bold",
              float: "right",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            SUBMIT
          </button>
        </div>
      </div>

      <SupportSection />

      <WebsiteFooter />
    </Layout>
  );
};

export default ProductPage;
