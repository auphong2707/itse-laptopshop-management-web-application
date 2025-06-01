import { Table, Tag, Button, Popconfirm, message, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useUser } from '../../utils/UserContext';

const OrderTable = ({ orders, page, limit, total_count, onTableChange, accessToken }) => {

  const handleStatusChange = async (orderId, newStatus) => {
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    try {
      await axios.patch(
        `http://localhost:8000/orders/admin/${orderId}/status`, 
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      message.success(`Order ${orderId} status updated to ${newStatus}`);
      onTableChange({ current: page, pageSize: limit }); // refresh table
    } catch (error) {
      message.error('Failed to update status');
    }
  };

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
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
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
    {
      title: 'Change Status',
      key: 'change_status',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Select
            defaultValue={record.status}
            style={{ width: 120, marginRight: 8 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            {['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'].map((status) => (
              <Select.Option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </>
      ),
    }
    
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
