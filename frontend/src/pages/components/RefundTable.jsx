import React from "react";
import { Typography, Image, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Text } = Typography;

const refundRequestInfo = {
  requestId: "RFD-20250409-001",
  name: "Nguyen Van A",
  email: "a.nguyen@example.com",
  phoneNumber: "0912345678",
  reason: "Sản phẩm bị lỗi kỹ thuật.",
  status: "Pending",
};

const refundedItemsData = [
  {
    id: 101,
    name: "MacBook Pro 14 inch 2023",
    image: "https://via.placeholder.com/80",
    refundQuantity: 1,
    purchaseDate: "2024-12-15",
    refundDate: "2025-04-05",
  },
  {
    id: 102,
    name: "Dell XPS 13 OLED",
    image: "https://via.placeholder.com/80",
    refundQuantity: 2,
    purchaseDate: "2025-01-10",
    refundDate: "2025-04-03",
  },
  {
    id: 103,
    name: "ASUS ROG Zephyrus G14",
    image: "https://via.placeholder.com/80",
    refundQuantity: 1,
    purchaseDate: "2025-03-01",
    refundDate: "2025-04-06",
  },
];

const RefundTable = () => {
  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1000px",
        margin: 0,
      }}
    >
      {/* Thông tin yêu cầu */}
      <div style={{ margin: 0, paddingBottom: "20px" }}>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Request ID:</strong> {refundRequestInfo.requestId}
        </p>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Name:</strong> {refundRequestInfo.name}
        </p>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Email:</strong> {refundRequestInfo.email}
        </p>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Phone Number:</strong> {refundRequestInfo.phoneNumber}
        </p>
      </div>

      {/* Bảng sản phẩm */}
      <div
        style={{
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          borderRadius: "6px",
          overflowX: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr 1fr 2fr 2fr 0.5fr",
            fontWeight: "bold",
            borderBottom: "2px solid #555",
            padding: "12px 16px",
            backgroundColor: "#f9f9f9",
            textAlign: "center",
          }}
        >
          <div>Image</div>
          <div>Product Name</div>
          <div>Refund Qty</div>
          <div style={{ paddingLeft: "20px" }}> 
            Purchase Date
          </div>
          <div>Refund Date</div>
          <div />
        </div>

        {/* Dòng dữ liệu */}
        {refundedItemsData.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 3fr 1fr 2fr 2fr 0.5fr",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #eee",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image
                src={item.image}
                width={60}
                height={60}
                style={{ objectFit: "contain", borderRadius: "4px" }}
                preview={false}
              />
            </div>
            <Text style={{ fontSize: "14px", textAlign: "left", paddingLeft: "40px" }}>{item.name}</Text>
            <Text>{item.refundQuantity}</Text>
            <div style={{ paddingLeft: "20px", textAlign: "center" }}>
              <Text>{item.purchaseDate}</Text>
            </div>
            <Text>{item.refundDate}</Text>
            <div>
              <Button type="text" icon={<EyeOutlined />} />
            </div>
          </div>
        ))}
      </div>

      {/* Lý do và trạng thái */}
      <div style={{ marginTop: "20px" }}>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Reason:</strong> {refundRequestInfo.reason}
        </p>
        <p style={{ margin: 0, paddingBottom: "5px" }}>
          <strong>Status:</strong> {refundRequestInfo.status}
        </p>
      </div>
    </div>
  );
};

export default RefundTable;
