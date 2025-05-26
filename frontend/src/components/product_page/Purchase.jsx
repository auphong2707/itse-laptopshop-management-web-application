import { useState } from "react";
import PropTypes from "prop-types";
import { Button, InputNumber, Typography, Flex } from "antd";
import { getAuth } from "firebase/auth";
import axios from "axios";

const { Text } = Typography;

const formatPrice = (price, quantity) => {
  if (isNaN(price) || price === null || price === undefined) {
    return "N/A";
  }
  price = price * quantity;
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const Purchase = ({ price, laptopId }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      console.log("Token:", token);

      const response = await axios.post(
        "http://localhost:8000/cart/add",
        {
          laptop_id: laptopId,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Added to cart:", response.data);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const formattedPrice = formatPrice(price, quantity);

  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        right: "-15px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        maxWidth: "750px",
        padding: "16px 0",
        zIndex: "1000",
      }}
    >
      <Flex
        style={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
        gap="16px"
      >
        <Text style={{ fontSize: "16px" }}>
          On Sale from <strong>{formattedPrice}₫</strong>
        </Text>

        <InputNumber
          min={1}
          max={100}
          value={quantity}
          onChange={handleQuantityChange}
          style={{ width: 60, textAlign: "center" }}
        />

        <Button
          type="primary"
          style={{
            background: "#0057ff",
            border: "none",
            borderRadius: "50px",
            padding: "12px 24px",
            fontWeight: "bold",
            fontSize: "14px",
            minWidth: "140px",
            minHeight: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0044cc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0057ff")}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </Flex>
    </div>
  );
};
Purchase.propTypes = {
  price: PropTypes.number.isRequired,
  laptopId: PropTypes.string.isRequired,
};

export default Purchase;
