import { useState, useEffect } from "react";
import { Table, Spin, Typography } from "antd";
import axios from "axios";
import { useUser } from "../../utils/UserContext.jsx";

const { Text } = Typography;

const formatPrice = (price) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const MyOrder = () => {
  const user = useUser();

  const [ordersData, setOrdersData] = useState({
    orders: [],
    total_count: 0,
    page: 1,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch product details using product_id
  const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8000/laptops/id/${productId}`);
      const product = response.data;
      const imageUrls = JSON.parse(product.product_image_mini || "[]");
      return {
        product_name: product.name,
        image: imageUrls.length > 0 ? `http://localhost:8000${imageUrls[0]}` : "/default-image.jpg",
      };
    } catch (err) {
      console.error("Error fetching product details:", err);
      return { product_name: "Unknown", image: "/default-image.jpg" }; // Default values if fetch fails
    }
  };

  // Function to fetch orders for the authenticated user
  const fetchOrders = async (page = 1, limit = 20) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.accessToken;

      const params = {
        page,
        limit,
      };

      const response = await axios.get("http://localhost:8000/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      // Fetch product details for each item in the orders
      const ordersWithProductInfo = await Promise.all(
        response.data.orders.map(async (order) => {
          const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              const productDetails = await fetchProductDetails(item.product_id);
              return {
                ...item,
                product_name: productDetails.product_name,
                image: productDetails.image,
                subtotal: item.price_at_purchase * item.quantity, // Calculate subtotal
              };
            })
          );

          return {
            ...order,
            items: itemsWithDetails,
          };
        })
      );

      setOrdersData({
        orders: ordersWithProductInfo,
        total_count: response.data.total_count,
        page,
        limit,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(ordersData.page, ordersData.limit);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Columns for displaying the orders in a table
  const columns = [
    {
      title: "Item",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={image}
            alt="Product"
            width={80}
            height={80}
            style={{ objectFit: "contain", borderRadius: "5px" }}
          />
        </div>
      ),
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (name) => <Text style={{ fontSize: "14px", fontWeight: "bold" }}>{name}</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <Text>{quantity}</Text>,
      align: "center",
    },
    {
      title: "Price",
      dataIndex: "price_at_purchase",
      key: "price_at_purchase",
      render: (price) => <Text>{formatPrice(price)}</Text>,
      align: "center",
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal) => (
        <Text>{formatPrice(subtotal)}</Text>
      ),
      align: "center",
    },
  ];

  // Handle page change in the table
  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, ordersData.limit);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>My Orders</h3>

      {error && <Text type="danger">{error}</Text>}

      {/* Loading indicator while fetching data */}
      {loading ? (
        <Spin tip="Loading orders..." />
      ) : (
        <Table
          columns={columns}
          dataSource={ordersData.orders.flatMap((order) => order.items)} // Flatten the items for each order
          pagination={{
            current: ordersData.page,
            pageSize: ordersData.limit,
            total: ordersData.total_count,
          }}
          onChange={handleTableChange}
          rowKey="product_id"
        />
      )}
    </div>
  );
};

export default MyOrder;
