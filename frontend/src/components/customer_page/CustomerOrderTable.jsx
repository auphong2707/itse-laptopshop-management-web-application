import { Table, Tag, Button, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const formatPrice = (price) => price.toLocaleString("vi-VN") + "đ";

const CustomerOrderTable = ({ ordersData, onTableChange, handleRefundRequest }) => {
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
    },
    {
      title: 'User Name',
      key: 'user_name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Shipping Address',
      dataIndex: 'shipping_address',
      key: 'shipping_address',
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: (method) => {
        const methodLabels = {
          'e-banking': 'E-Banking',
          'delivery': 'Cash on Delivery',
        };
        const methodColors = {
          'e-banking': 'green',
          'delivery': 'blue',
        };
        return <Tag color={methodColors[method] || 'default'}>{methodLabels[method] || method}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const statusColors = {
          pending: 'orange',
          processing: 'blue',
          shipping: 'geekblue',
          delivered: 'green',
          cancelled: 'red',
          refunded: 'magenta',
        };
        return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (val) => dayjs(val).format('DD-MM-YYYY HH:mm'),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleRefundRequest(record.id)} 
          disabled={record.status !== 'delivered'}
        >
          Refund
        </Button>
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

  return (
    <Table
      columns={columns}
      dataSource={ordersData.orders}
      expandable={{ expandedRowRender }}
      rowKey="id"
      pagination={{
        current: ordersData.page,
        pageSize: 20,
        total: ordersData.total_count,
        showSizeChanger: false,
      }}
      scroll={{ x: 'max-content' }}
      onChange={onTableChange}
    />
  );
};

export default CustomerOrderTable;
