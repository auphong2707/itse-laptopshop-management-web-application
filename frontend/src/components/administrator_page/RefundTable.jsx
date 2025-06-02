import { useState } from "react";
import {
  Table,
  Tag,
  Descriptions,
  Button,
  Popconfirm,
  message,
} from "antd";
import dayjs from "dayjs";

/**
 * RefundTable component renders a list of refund requests with full order details
 * shown in an expandable row. Only two refund statuses are supported: "Pending" and "Resolved".
 *
 * Props:
 *  - data: Array of refund requests (each contains an "order" object).
 *  - onResolve: optional callback fired after the admin confirms resolution.
 */
const RefundTable = ({ data, onResolve }) => {
  // Local pagination state to allow page‑size changes
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  // Tag color mapping for the two possible states
  const statusColors = {
    Pending: "orange",
    Resolved: "green",
  };

  /** Columns for the items list inside the expandable section */
  const itemColumns = [
    { title: "Product ID", dataIndex: "product_id", key: "product_id", width: 120 },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 100 },
    {
      title: "Price at Purchase",
      dataIndex: "price_at_purchase",
      key: "price_at_purchase",
      render: (v) => v.toLocaleString(),
    },
  ];

  /** Renders full order information when a row is expanded */
  const expandedRowRender = (record) => {
    const { order } = record;
    if (!order) return null;
    return (
      <>
        <Descriptions
          title={`Order #${order.id} Details`}
          bordered
          size="small"
          column={2}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="User ID">{order.user_id}</Descriptions.Item>
          <Descriptions.Item label="Order Status">{order.status}</Descriptions.Item>
          <Descriptions.Item label="First Name">{order.first_name}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{order.last_name}</Descriptions.Item>
          <Descriptions.Item label="User Name">{order.user_name}</Descriptions.Item>
          <Descriptions.Item label="User Email">{order.user_email}</Descriptions.Item>
          <Descriptions.Item label="Shipping Address" span={2}>
            {order.shipping_address}
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">{order.phone_number}</Descriptions.Item>
          <Descriptions.Item label="Company">{order.company}</Descriptions.Item>
          <Descriptions.Item label="Country">{order.country}</Descriptions.Item>
          <Descriptions.Item label="Zip Code">{order.zip_code}</Descriptions.Item>
          <Descriptions.Item label="Total Price">
            {order.total_price.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(order.created_at).format("YYYY-MM-DD HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {dayjs(order.updated_at).format("YYYY-MM-DD HH:mm")}
          </Descriptions.Item>
        </Descriptions>

        {/* Items purchased in this order */}
        <Table
          dataSource={order.items.map((item, idx) => ({ key: idx, ...item }))}
          columns={itemColumns}
          pagination={false}
          size="small"
        />
      </>
    );
  };

  /** Handler for marking a ticket as resolved */
  const handleResolve = (record) => {
    if (typeof onResolve === "function") {
      onResolve(record);
    } else {
      // demo feedback
      message.success(`Refund #${record.id} marked as resolved`);
    }
  };

  /** Top-level refund columns */
  const columns = [
    {
      title: "Refund ID",
      dataIndex: "id",
      key: "id",
      fixed: "left",
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 120,
    },
    {
      title: "Customer Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 150,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Resolved", value: "Resolved" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text) => <Tag color={statusColors[text] || "default"}>{text}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (value) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Resolved At",
      dataIndex: "resolved_at",
      key: "resolved_at",
      width: 180,
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) =>
        record.status === "Pending" ? (
          <Popconfirm
            title="Resolve refund"
            description="Are you sure this ticket has been resolved?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleResolve(record)}
          >
            <Button type="primary" size="small">
              Resolve
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  /** Handle page or pageSize change */
  const handleTableChange = (pageInfo) => {
    setPagination((prev) => ({ ...prev, ...pageInfo }));
  };

  return (
    <Table
      dataSource={data.map((r) => ({ key: r.id, ...r }))}
      columns={columns}
      rowKey="id"
      expandable={{ expandedRowRender }}
      pagination={pagination}
      onChange={handleTableChange}
      scroll={{ x: 1500 }}
    />
  );
};

export default RefundTable;
