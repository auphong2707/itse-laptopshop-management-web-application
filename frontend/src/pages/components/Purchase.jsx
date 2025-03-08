import React, { useState } from "react";
import { Button, Select, Typography, Flex } from "antd";

const { Text } = Typography;

const Purchase = () => {
  const [quantity, setQuantity] = useState(1);
  const price = 3299.0;
  const totalPrice = price * quantity;

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  return (
    <div style={{ 
      position: "absolute", 
      top: "100px",
      right: "-5px", 
      display: "flex", 
      justifyContent: "flex-end", 
      alignItems: "center", 
      width: "100%", 
      maxWidth: "750px", 
      padding: "16px 0", 
      zIndex: "1000"
    }}>
      <Flex style={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} gap="16px">
        {/* Price Display */}
        <Text style={{ fontSize: "16px" }}>
          On Sale from <strong>${totalPrice.toFixed(2)}</strong>
        </Text>

        {/* Quantity Selector */}
        <Select defaultValue={1} onChange={handleQuantityChange} style={{ width: 60 }}>
          {[...Array(10).keys()].map((i) => (
            <Select.Option key={i + 1} value={i + 1}>
              {i + 1}
            </Select.Option>
          ))}
        </Select>

        {/* Buttons */}
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
          onMouseEnter={(e) => e.currentTarget.style.background = "#0044cc"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#0057ff"}
        >
          Add to Cart
        </Button>

        {/* PayPal Button */}
        <Button 
          type="primary" 
          style={{ 
            background: "#ffc439", 
            border: "none",
            borderRadius: "50px", 
            padding: "12px 24px", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "140px",
            minHeight: "45px",
            transition: "background 0.3s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e6b800"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#ffc439"}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
            alt="PayPal" 
            style={{ height: "20px" }}
          />
        </Button>
      </Flex>
    </div>
  );
};

export default Purchase;
