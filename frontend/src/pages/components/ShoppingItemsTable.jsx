import React, { useState } from "react";
import { Card, Typography, Image, InputNumber, Button, Layout } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

// Component phụ (hiển thị thông tin sản phẩm)
const Items = () => {
  const [quantity, setQuantity] = useState(1);
  const price = 34720000; // Giá cố định
  const totalPrice = formatPrice(price * quantity);

  const handleQuantityChange = (value) => {
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
        alignItems: "center",
        gap: "15px",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Ảnh sản phẩm */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image
          src={"https://example.com/image1.jpg"} // Thay bằng ảnh thật
          width={80}
          height={80}
          style={{ objectFit: "contain", borderRadius: "5px" }}
          preview={false}
        />
      </div>

      {/* Tên sản phẩm */}
      <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
        MSI MEG Trident X 10SD-1012AU Intel i7 10700K, 2070 SUPER, 32GB RAM, 1TB SSD
      </Text>

      {/* Giá tiền đơn vị */}
      <div style={{ display: "flex", justifyContent: "center" }}>  
        <Text 
          style={{ fontSize: "16px", fontWeight: "bold" }}
          >{formatPrice(price)}
        </Text>
      </div>
      {/* Bộ chọn số lượng */}
      <div style={{ display: "flex", justifyContent: "center" }}>  
        <InputNumber 
          min={1} 
          value={quantity} 
          onChange={handleQuantityChange} 
          style={{ width: "60px", textAlign: "center", justifyContent: "center"}} 
        />
      </div>
      {/* Tổng tiền */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Text  
          style={{ fontSize: "16px", fontWeight: "bold" }}
          >{totalPrice}
        </Text>
        </div>
      {/* Nút thao tác */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", paddingRight: "14px" }}>
          <Button type="text" icon={<EyeOutlined />} style={{ color: "#888" }} />
          <Button type="text" icon={<DeleteOutlined />} danger />
      </div>
    </div>
  );
};

// Component chính (bảng hiển thị danh mục + Items)
const ShoppingItemsTable = () => {
  return (
    <Card style={{ padding: "20px", borderRadius: "8px", width: "55%" }} bordered={false}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
          fontWeight: "bold",
          paddingTop:"10px",
          paddingBottom: "15px",
          borderBottom: "2px solid #ddd",
          gap: "15px"
        }}
      >
        <Text style={{ display: "flex", justifyContent: "center"}}>Item</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Name</Text> 
        <Text style={{ display: "flex", justifyContent: "center"}}>Price</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Qty</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Subtotal</Text>
        
      </div>
      
      {/* Danh sách sản phẩm */}
      <Items />
      <Items />
    </Card>
  );
};

export default ShoppingItemsTable;
