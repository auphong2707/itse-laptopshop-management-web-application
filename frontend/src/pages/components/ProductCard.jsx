import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Rate,
  Tooltip,
  Image,
  Button,
  Modal,
  message,
} from "antd";
import {
  CheckCircleFilled,
  InfoCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const useAuthUser = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        const role = tokenResult.claims.role;
        setUser({ ...currentUser, role });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return user;
};

const ProductCard = ({
  inStock,
  imgSource,
  rate,
  numRate,
  productName,
  originalPrice,
  salePrice,
  productId,
}) => {
  const [productData, setProductData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState(""); // State to track deletion status
  const user = useAuthUser();
  const isAdmin = user?.role === "admin"; // Boolean flag

  const showModal = () => {
    setModalVisible(true); // Show the modal
  };

  const handleOk = async () => {
    setLoading(true); // Set loading state to true before starting deletion
    setDeletionStatus("Deleting product..."); // Update modal content to show "Deleting product"

    try {
      await handleDelete(productId); // Call the delete function
      setDeletionStatus("The product has been deleted."); // Update modal content after successful deletion
      message.success("Product deleted successfully");

      setTimeout(() => {
        setLoading(false);
        window.location.reload();
      }, 10000);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeletionStatus("Failed to delete the product."); // Update modal content if deletion fails
      message.error("Failed to delete the product");
      setLoading(false); // Set loading to false after completion
    }
  };

  const handleCancel = () => {
    setModalVisible(false); // Just close the modal without deleting
    message.error("Product deletion cancelled");
  };

  useEffect(() => {
    fetch(`http://localhost:8000/laptops/id/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        const imageUrls = JSON.parse(data.product_image_mini || "[]").map(
          (url) => `http://localhost:8000${url}`,
        );
        setProductData({
          ...data,
          imageUrl: imageUrls.length > 0 ? imageUrls[0] : "/default-image.jpg",
        });
      });
  }, [productId]);

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:8000/laptops/${productId}`);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (!productData) return null;

  return (
    <div style={{ padding: 3, position: "relative" }}>
      {isAdmin && (
        <Button
          size="small"
          shape="circle"
          icon={<CloseOutlined />}
          style={{
            position: "absolute",
            top: 5,
            right: -5,
            zIndex: 1,
            backgroundColor: "#fff",
            borderColor: "#ccc",
          }}
          onClick={showModal}
        />
      )}

      {/* Modal to confirm deletion */}
      <Modal
        title="Confirm Deletion"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes, delete it"
        cancelText="Cancel"
        okType="danger"
        loading={loading}
      >
        <p>{deletionStatus || "Are you sure you want to delete this product? This action cannot be undone."}</p>
      </Modal>

      <Link
        to={isAdmin ? `/admin/detail/${productId}` : `/product/${productId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Card
          style={{
            width: 228,
            height: 345,
            borderRadius: 2,
            cursor: "pointer",
          }}
          hoverable
          variant="borderless"
        >
          {/* Availability Check */}
          {inStock ? (
            <div style={{ marginBottom: 10, color: "#78A962" }}>
              <CheckCircleFilled style={{ fontSize: 12 }} />
              <Text
                strong
                style={{ marginLeft: 7, color: "#78A962", fontSize: 12 }}
              >
                in stock
              </Text>
            </div>
          ) : (
            <div style={{ marginBottom: 10, color: "#C94D3F" }}>
              <InfoCircleFilled style={{ fontSize: 12 }} />
              <Text
                strong
                style={{ marginLeft: 7, color: "#C94D3F", fontSize: 12 }}
              >
                check availability
              </Text>
            </div>
          )}

          {/* Product Image */}
          <Image
            src={productData.imageUrl}
            height={120}
            width="100%"
            preview={false}
          />

          {/* Star Rating & Reviews */}
          <div style={{ marginTop: 2, width: "100%" }}>
            <Rate disabled value={rate} style={{ fontSize: 10 }} allowHalf />
            <Text
              style={{ marginLeft: 10, color: "#666", fontSize: 10 }}
              strong={false}
            >
              ({numRate} Reviews)
            </Text>
          </div>

          {/* Product Name */}
          <div style={{ marginTop: 5 }}>
            <Tooltip title={productName} placement="top">
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ cursor: "pointer", fontSize: 13 }}
                strong={false}
              >
                {productName}
              </Paragraph>
            </Tooltip>
          </div>

          {/* Price Section */}
          <div>
            <Text delete style={{ fontSize: 13, color: "#888" }} strong={false}>
              {formatPrice(originalPrice)}đ
            </Text>
            <Title level={4} style={{ margin: 0, color: "#000" }}>
              {formatPrice(salePrice)}đ
            </Title>
          </div>
        </Card>
      </Link>
    </div>
  );
};

ProductCard.propTypes = {
  inStock: PropTypes.bool,
  imgSource: PropTypes.string,
  rate: PropTypes.number,
  numRate: PropTypes.number,
  productName: PropTypes.string,
  originalPrice: PropTypes.number,
  salePrice: PropTypes.number,
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  user: PropTypes.shape({
    role: PropTypes.string,
  }),
};

const getRandomProductCardData = () => {
  const originalPrice = Math.random() * 1000;
  const salePrice = originalPrice - Math.random() * 100;

  return {
    inStock: Math.random() > 0.5,
    imgSource: null,
    rate: Math.random() * 5,
    numRate: Math.floor(Math.random() * 100),
    productName:
      `PRODUCT ${Math.floor(Math.random() * 100)}` +
      " (" +
      "LENGTH TEST ".repeat(5) +
      ")",
    originalPrice: originalPrice,
    salePrice: salePrice,
  };
};

export default ProductCard;
export { getRandomProductCardData };
