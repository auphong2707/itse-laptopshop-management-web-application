import React, { useState,useEffect  } from "react";
import { Typography, Image, InputNumber, Button, Layout, Space } from "antd";
import { DeleteOutlined, EyeOutlined} from "@ant-design/icons";

const { Text } = Typography;


//Hàm format tiền
const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

// Giả sử đây là mảng dữ liệu sản phẩm (chứa tên, giá, v.v.)
const productsData = [
  {
    id: 1,
    name: "MSI MEG Trident X 10SD",
    price: 34720000,
    image: "https://example.com/image1.jpg", // Thay URL ảnh thật nếu cần
  },
  {
    id: 2,
    name: "Laptop ABC",
    price: 15000000,
    image: "https://example.com/image2.jpg",
  },
  {
    id: 3,
    name: "Laptop XYZ",
    price: 22000000,
    image: "https://example.com/image3.jpg",
  },
];

// Component phụ (hiển thị thông tin sản phẩm)
const Items = ({ product, index, onSubtotalChange }) => {
  const [quantity, setQuantity] = useState(0);
  const rawSubtotal = formatPrice(product.price * quantity);

  const handleQuantityChange = (value) => {
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
      onSubtotalChange(product.price * value, index);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
        alignItems: "center",
        gap: "15px",
        padding: "25px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Ảnh sản phẩm */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image
          src={product.image} // Thay bằng ảnh thật
          width={80}
          height={80}
          style={{ objectFit: "contain", borderRadius: "5px" }}
          preview={false}
        />
      </div>

      {/* Tên sản phẩm */}
      <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
        {product.name}
      </Text>

      {/* Giá tiền đơn vị */}
      <div style={{ display: "flex", justifyContent: "center" }}>  
        <Text 
          style={{ fontSize: "16px", fontWeight: "bold" }}
          >{formatPrice(product.price)}
        </Text>
      </div>
      {/* Bộ chọn số lượng */}
      <div style={{ display: "flex", justifyContent: "center" }}>  
        <InputNumber 
          min={0} 
          value={quantity} 
          onChange={handleQuantityChange} 
          style={{ width: "60px", textAlign: "center", justifyContent: "center"}} 
        />
      </div>
      {/* Tổng tiền */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Text  
          style={{ fontSize: "16px", fontWeight: "bold" }}
          >{rawSubtotal}
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
const ShoppingItemsTable = ({ setTotalPrice }) => {

  const [subTotals, setSubTotals] = useState(Array(productsData.length).fill(0));

  const handleSubtotalChange = (newSubtotal, index) => {
    const newSubTotals = [...subTotals];
    newSubTotals[index] = newSubtotal;
    setSubTotals(newSubTotals);
  };

  useEffect(() => {
    const sum = subTotals.reduce((acc, val) => acc + val, 0);
    // setTotalPrice ở đây để đẩy giá trị tổng lên ShoppingCartPage
    setTotalPrice(sum);
  }, [subTotals, setTotalPrice]);

  return (
    <div style={{ paddingTop: "0px",
                  paddingBottom: "20px",
                  paddingLeft: "20px",
                  paddingRight: "20px", 
                  borderRadius: "8px" }} 
                  bordered={false}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
          fontWeight: "bold",
          paddingTop:"10px",
          paddingBottom: "15px",
          borderBottom: "1.5px solid #ddd",
          gap: "15px"
        }}
      >
        <Text style={{ display: "flex", justifyContent: "center"}}>Item</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Name</Text> 
        <Text style={{ display: "flex", justifyContent: "center"}}>Price</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Qty</Text>
        <Text style={{ display: "flex", justifyContent: "center"}}>Subtotal</Text>
        
      </div>

      {/* Danh sách sản phẩm (.map) */}
      {productsData.map((prod, index) => (
        <Items
          key={prod.id}
          product={prod}
          index={index}
          onSubtotalChange={handleSubtotalChange}
        />
      ))}


      

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
          fontWeight: "bold",
          paddingTop:"15px",
          paddingBottom: "15px",
          borderBottom: "1px solid #ddd",
          gap: "15px"
        }}
      >
        <Text />
        <Text />
        <Text />
        <Text style={{ display: "flex", justifyContent: "center", fontSize: "17px"}}>Total price: </Text>
        <Text style={{ display: "flex", justifyContent: "center", fontSize: "17px"}}>{formatPrice(subTotals.reduce((acc, val) => acc + val, 0))}</Text>
        
      </div>
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center",
          paddingTop: "20px",
          paddingBottom: "15px",
          paddingLeft: "15px",
          paddingRight: "15px", 
        }}
      >
        {/* Nút Clear Shopping Cart */}
        <Button
          type="primary"
          style={{
            backgroundColor: "#000",   // màu nền đen
            borderColor: "#000",       // viền đen (trùng màu nền)
            borderRadius: "9999px",    // bo tròn
            fontWeight: "bold"
          }}
        >
          Clear Shopping Cart
        </Button>

        {/* Nút Continue Shopping */}
        <Button
          type="primary"
          style={{
            backgroundColor: "#000",
            borderColor: "#000",
            borderRadius: "9999px",
            fontWeight: "bold",
            
          }}
        >
          Continue Shopping
        </Button>
      </div> 

      

    </div>
  );
};

export default ShoppingItemsTable;
