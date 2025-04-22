import { Table, Tag } from 'antd';
import dayjs from 'dayjs';

const OrderTable = ({ orders, page, limit, total_count, onTableChange }) => {
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
    },
    {
      title: 'User Name',
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
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Zip Code',
      dataIndex: 'zip_code',
      key: 'zip_code',
    },
    {
      title: 'Shipping Address',
      dataIndex: 'shipping_address',
      key: 'shipping_address',
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
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => dayjs(val).format('DD-MM-YYYY HH:mm'),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (val) => dayjs(val).format('DD-MM-YYYY HH:mm'),
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
    <Table
      columns={columns}
      dataSource={orders}
      expandable={{ expandedRowRender }}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      pagination={{
        total: total_count,
        pageSize: limit,
        current: page,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={onTableChange}
    />
  );
};

export default OrderTable;
