import { Table, Card, Tag } from 'antd';

// Sample mock data
const sampleData = {
  total_count: 1,
  page: 0,
  limit: 10,
  orders: [
    {
      id: 1001,
      user_id: 'u123',
      first_name: 'John',
      last_name: 'Doe',
      user_name: 'johndoe',
      user_email: 'john@example.com',
      total_price: '$250.00',
      status: 'processing',
      created_at: '2025-04-22T01:40:38.015Z',
      updated_at: '2025-04-22T02:00:00.000Z',
      shipping_address: '123 Main St, New York, NY',
      phone_number: '123-456-7890',
      company: 'Example Corp',
      country: 'USA',
      zip_code: '10001',
      items: [
        {
          product_id: 501,
          quantity: 2,
          price_at_purchase: '$100.00',
        },
        {
          product_id: 502,
          quantity: 1,
          price_at_purchase: '$50.00',
        },
      ],
    },
  ],
};

const OrderTable = () => {
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (_, record) =>
        `${record.first_name} ${record.last_name} (${record.user_name})`,
    },
    {
      title: 'Email',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  const expandedRowRender = (order) => {
    const itemColumns = [
      {
        title: 'Product ID',
        dataIndex: 'product_id',
        key: 'product_id',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: 'Price at Purchase',
        dataIndex: 'price_at_purchase',
        key: 'price_at_purchase',
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
    <Card title="Order Table">
      <Table
        columns={columns}
        dataSource={sampleData.orders}
        expandable={{ expandedRowRender }}
        rowKey="id"
        pagination={{
          total: sampleData.total_count,
          pageSize: sampleData.limit,
          current: sampleData.page + 1,
        }}
      />
    </Card>
  );
};

export default OrderTable;
