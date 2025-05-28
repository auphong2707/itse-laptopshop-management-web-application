import { useState, useEffect } from "react";
import { Table, Spin, Typography, Button, Tag } from "antd";
import axios from "axios";
import { useUser } from "../../utils/UserContext.jsx";
import dayjs from "dayjs";

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
      return { product_name: "Unknown", image: "/default-image.jpg" };
    }
  };

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

      const ordersWithProductInfo = await Promise.all(
        response.data.orders.map(async (order) => {
          const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              const productDetails = await fetchProductDetails(item.product_id);
              return {
                ...item,
                product_name: productDetails.product_name,
                image: productDetails.image,
                subtotal: item.price_at_purchase * item.quantity,
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

  const handleRefundRequest = (orderId) => {
    console.log("Refund requested for order ID:", orderId);
    // TODO: Implement API call or modal for refund request
    // Example: message.success(`Refund request for Order ${orderId} submitted`);
  };

  const handleCancelOrder = (orderId) => {
    console.log("Cancel requested for order ID:", orderId);
    // TODO: Call API or show confirmation for canceling order
    // Example: message.success(`Order ${orderId} has been canceled`);
  };

  useEffect(() => {
    if (user) {
      fetchOrders(ordersData.page, ordersData.limit);
    } else {
      setLoading(false);
    }
  }, [user]);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => <Text>{formatPrice(price)}</Text>,
      align: "center",
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          pending: 'gold',
          processing: 'blue',
          shipped: 'cyan',
          delivered: 'green',
          cancelled: 'red',
          refunded: 'volcano',
        };
    
        return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
      },
      align: "center"
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (val) => dayjs(val).format('DD-MM-YYYY HH:mm'),
      align: "center",
    },
    {
      title: "",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleRefundRequest(record.id)} style={{ marginRight: 8 }}>
            Refund
          </Button>
          <Button danger onClick={() => handleCancelOrder(record.id)}>
            Cancel
          </Button>
        </>
      ),
    },
  ];

  const expandedRowRender = (order) => {
    const itemColumns = [
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        render: (image) => (
          <img
            src={image}
            alt="Product"
            width={60}
            height={60}
            style={{ objectFit: "contain", borderRadius: "5px" }}
          />
        ),
        align: "center",
      },
      {
        title: "Product Name",
        dataIndex: "product_name",
        key: "product_name",
        render: (name) => <div style={{ maxWidth: 550 }}>{name}</div>,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        align: "center",
      },
      {
        title: "Price at Purchase",
        dataIndex: "price_at_purchase",
        key: "price_at_purchase",
        render: (price) => <Text>{formatPrice(price)}</Text>,
        align: "center",
      },
      {
        title: "Total",
        dataIndex: "subtotal",
        key: "subtotal",
        render: (subtotal) => <Text>{formatPrice(subtotal)}</Text>,
        align: "center",
      },
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={order.items}
        rowKey={(item) => `${order.id}-${item.product_id}`}
        pagination={false}
      />
    );
  };

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, ordersData.limit);
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      {error && <Text type="danger">{error}</Text>}

      {loading ? (
        <Spin tip="Loading orders..." />
      ) : (
        <Table
          columns={columns}
          dataSource={ordersData.orders}
          expandable={{ expandedRowRender }}
          rowKey="id"
          pagination={{
            current: ordersData.page,
            pageSize: 10,
            total: ordersData.total_count,
            showSizeChanger: false,
          }}
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
};

export default MyOrder;
