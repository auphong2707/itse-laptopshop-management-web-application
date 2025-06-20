import { Table, Tag, Button, Image } from "antd";
import { EditOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const handleEdit = (record) => {
  window.location.href = `http://localhost:5173/admin/detail/${record.id}`;
};

const StockAlertTable = ({ data, loading, pagination, onPageChange }) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "50px",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      align: "center",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (src) => <Image width={150} src={src} />,
      align: "center",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      width: "200px",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      align: "center",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      align: "center",
      width: "120px",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: "120px",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.quantity === 0 ? "red" : "orange"}>
          {record.quantity === 0 ? "Out of Stock" : "Low"}
        </Tag>
      ),
      width: "150px",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      width: "100px",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </div>
      ),
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        onChange: onPageChange,
      }}
    />
  );
};
StockAlertTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.object.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default StockAlertTable;
