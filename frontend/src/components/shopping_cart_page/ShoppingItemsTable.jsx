import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Modal, Typography, Image, InputNumber, Button } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import { getToken } from "../../utils/authService";

const { Text } = Typography;

const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const Items = ({ product, index, onSubtotalChange, onRemove }) => {
  const [quantity, setQuantity] = useState(product.quantity || 0);
  const rawSubtotal = formatPrice(product.sale_price * quantity);

  const handleQuantityChange = async (value) => {
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
      onSubtotalChange(product.sale_price * value, index);

      try {
        const token = getToken();
        if (!token) throw new Error("User not authenticated");

        await axios.put(
          "http://localhost:8000/cart/update",
          {
            laptop_id: product.id,
            new_quantity: value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (err) {
        console.error("Error updating quantity in cart:", err);
      }
    }
  };

  useEffect(() => {
    onSubtotalChange(product.sale_price * quantity, index);
  }, []);

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
      {/* Product Image */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image
          src={product.imageUrl}
          width={80}
          height={80}
          style={{ objectFit: "contain", borderRadius: "5px" }}
          preview={false}
        />
      </div>

      {/* Product Name */}
      <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
        {product.name.toUpperCase()}
      </Text>

      {/* Product Price */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
          {formatPrice(product.sale_price)}
        </Text>
      </div>
      {/* Bộ chọn số lượng */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <InputNumber
          min={1}
          value={quantity}
          onChange={handleQuantityChange}
          style={{
            width: "60px",
            textAlign: "center",
            justifyContent: "center",
          }}
        />
      </div>
      {/* Total price for products */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
          {rawSubtotal}
        </Text>
      </div>
      {/* Nút thao tác */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          paddingRight: "14px",
        }}
      >
        <Button type="text" icon={<EyeOutlined />} style={{ color: "#888" }} />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => onRemove(product)}
        />
      </div>
    </div>
  );
};

const ShoppingItemsTable = ({ setTotalPrice }) => {
  const [cartItems, setCartItems] = useState([]);
  const [subTotals, setSubTotals] = useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();

          // 1. Get cart
          const cartResponse = await axios.get(
            "http://localhost:8000/cart/view",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const cartData = cartResponse.data;

          // 2. Fetch product info
          const productFetches = Object.keys(cartData).map((id) =>
            axios.get(`http://localhost:8000/laptops/id/${id}`),
          );

          const productResponses = await Promise.all(productFetches);

          // 3. Combine product info
          const productsWithQty = productResponses.map((res) => {
            const product = res.data;
            const quantity = cartData[product.id];
            const imageUrls = JSON.parse(
              product.product_image_mini || "[]",
            ).map((url) => `http://localhost:8000${url}`);

            return {
              ...product,
              quantity,
              imageUrl:
                imageUrls.length > 0 ? imageUrls[0] : "/default-image.jpg",
            };
          });

          setCartItems(productsWithQty);
          setSubTotals(
            productsWithQty.map((item) => item.sale_price * item.quantity),
          );
        } catch (err) {
          console.error("Error fetching cart:", err);
        }
      } else {
        console.warn("No user logged in");
      }
    });

    return () => unsubscribe(); // clean up the listener
  }, []);

  const handleSubtotalChange = (newSubtotal, index) => {
    const newSubTotals = [...subTotals];
    newSubTotals[index] = newSubtotal;
    setSubTotals(newSubTotals);
  };

  const handleRemoveItem = (product) => {
    Modal.confirm({
      title: `Do you want to delete the product "${product.name}" from the cart?`,
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");

          const token = await user.getIdToken();

          await axios.delete(`http://localhost:8000/cart/remove/${product.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Remove from UI
          const updatedItems = cartItems.filter((item) => item.id !== product.id);
          setCartItems(updatedItems);
          setSubTotals(updatedItems.map((item) => item.sale_price * item.quantity));

          // Show success message
          Modal.success({
            title: "Product deleted successfully",
            okText: "OK",
          });
        } catch (err) {
          console.error("Error removing item from cart:", err);
        }
      },
    });
  };




  const handleClearCart = () => {
    Modal.confirm({
      title: "Are you sure you want to clear the entire cart?",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");

          const token = await user.getIdToken();

          await axios.delete("http://localhost:8000/cart/clear", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Clear UI state
          setCartItems([]);
          setSubTotals([]);
          setTotalPrice(0);

          // Show success modal
          Modal.success({
            title: "Shopping cart has been cleared.",
            okText: "OK",
          });
        } catch (err) {
          console.error("Error clearing cart:", err);
        }
      },
    });
  };




  useEffect(() => {
    const sum = subTotals.reduce((acc, val) => acc + val, 0);
    setTotalPrice(sum);
  }, [subTotals, setTotalPrice]);

  return (
    <div style={{ padding: "20px", borderRadius: "8px" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
          fontWeight: "bold",
          paddingBottom: "15px",
          borderBottom: "1.5px solid #ddd",
          gap: "15px",
        }}
      >
        <Text style={{ textAlign: "center" }}>Item</Text>
        <Text style={{ textAlign: "center" }}>Name</Text>
        <Text style={{ textAlign: "center" }}>Price</Text>
        <Text style={{ textAlign: "center" }}>Qty</Text>
        <Text style={{ textAlign: "center" }}>Subtotal</Text>
      </div>

      {/* Render cart items dynamically */}
      {cartItems.map((prod, index) => (
        <Items
          key={prod.id}
          product={prod}
          index={index}
          onSubtotalChange={handleSubtotalChange}
          onRemove={handleRemoveItem}
        />
      ))}

      {/* Total price */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 2fr 1fr 1fr 1fr 0.5fr",
          fontWeight: "bold",
          paddingTop: "15px",
          paddingBottom: "15px",
          borderBottom: "1px solid #ddd",
          gap: "15px",
        }}
      >
        <Text />
        <Text />
        <Text />
        <Text style={{ textAlign: "center", fontSize: "17px" }}>
          Total price:
        </Text>
        <Text style={{ textAlign: "center", fontSize: "17px" }}>
          {formatPrice(subTotals.reduce((acc, val) => acc + val, 0))}
        </Text>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "20px",
        }}
      >
        <Button
          type="primary"
          style={{ borderRadius: "9999px", fontWeight: "bold" }}
          onClick={handleClearCart}
        >
          Clear Shopping Cart
        </Button>
        <Button
          type="primary"
          style={{ borderRadius: "9999px", fontWeight: "bold" }}
        >
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};
Items.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sale_price: PropTypes.number.isRequired,
    quantity: PropTypes.number,
    imageUrl: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onSubtotalChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

ShoppingItemsTable.propTypes = {
  setTotalPrice: PropTypes.func.isRequired,
};

export default ShoppingItemsTable;
