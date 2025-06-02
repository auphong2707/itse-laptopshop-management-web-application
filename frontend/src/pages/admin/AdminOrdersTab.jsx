import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Row, Col, Select, DatePicker } from "antd";
import axios from "axios";

import { useUser } from "../../utils/UserContext";
import OrderTable from "../../components/administrator_page/OrderTable";

const { RangePicker } = DatePicker;

const AdminOrdersTab = () => {
  const user = useUser();
  const [form] = Form.useForm();

  const [ordersData, setOrdersData] = useState({
    orders: [],
    total_count: 0,
    page: 1,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (page = 1, limit = 20, filterValues = {}) => {
    if (!user) return;
    setLoading(true);

    try {
      const token = await user.accessToken;

      const params = {
        page,
        limit,
      };

      if (filterValues.userId) params.userId = filterValues.userId;
      if (filterValues.date_range) {
        const [start, end] = filterValues.date_range;
        if (start) params.start_date = start.toISOString();
        if (end) params.end_date = end.toISOString();
      }
      if (filterValues.status) params.status = filterValues.status;

      const response = await axios.get("http://localhost:8000/orders/admin/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setOrdersData({
        orders: response.data.orders,
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
    if (user?.role === 'admin') {
      fetchOrders(1, ordersData.limit, form.getFieldsValue());
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleTableChange = (pagination) => {
    const filters = form.getFieldsValue();
    fetchOrders(pagination.current, pagination.pageSize, filters);
  };

  const handleFilterSubmit = (values) => {
    fetchOrders(1, ordersData.limit, values); // Correct: use current form values directly
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;
  if (user?.role !== "admin") return <p>Access denied: Admins only</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Card style={{ marginBottom: '1rem' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterSubmit}
          initialValues={{
            userId: '',
            date_range: [],
            status: undefined,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="User ID" name="userId">
                <Input placeholder="Enter User ID" allowClear/>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={8}>
              <Form.Item label="Date Range" name="date_range">
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD-MM-YYYY HH:mm"
                  style={{ width: '100%' }}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Status" name="status">
                <Select placeholder="Select status" allowClear>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="processing">Processing</Select.Option>
                  <Select.Option value="shipping">Shipped</Select.Option>
                  <Select.Option value="delivered">Delivered</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                  <Select.Option value="refunded">Refunded</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Apply Filters
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <OrderTable
        orders={ordersData.orders}
        page={ordersData.page}
        limit={ordersData.limit}
        total_count={ordersData.total_count}
        onTableChange={handleTableChange}
        accessToken={user.accessToken}
      />
    </div>
  );
};

export default AdminOrdersTab;