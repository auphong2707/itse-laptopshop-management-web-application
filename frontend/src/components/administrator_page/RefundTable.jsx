import { Typography, Image, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Text } = Typography;

const RefundTable = ({ refundItems, requestInfo }) => {
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
      {requestInfo && (
        <div style={{ margin: 0, paddingBottom: "20px" }}>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Request ID:</strong> {requestInfo.requestId}
          </p>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Name:</strong> {requestInfo.name}
          </p>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Email:</strong> {requestInfo.email}
          </p>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Phone Number:</strong> {requestInfo.phoneNumber}
          </p>
        </div>
      )}

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
          <div style={{ paddingLeft: "20px" }}>Purchase Date</div>
          <div>Refund Date</div>
          <div />
        </div>

        {/* Dòng dữ liệu */}
        {refundItems.map((item) => (
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
                src={item.image || "https://via.placeholder.com/80"}
                width={60}
                height={60}
                style={{ objectFit: "contain", borderRadius: "4px" }}
                preview={false}
              />
            </div>
            <Text
              style={{
                fontSize: "14px",
                textAlign: "left",
                paddingLeft: "40px",
              }}
            >
              {item.name}
            </Text>
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
      {requestInfo && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Reason:</strong> {requestInfo.reason}
          </p>
          <p style={{ margin: 0, paddingBottom: "5px" }}>
            <strong>Status:</strong> {requestInfo.status}
          </p>
        </div>
      )}
    </div>
  );
};

export default RefundTable;
