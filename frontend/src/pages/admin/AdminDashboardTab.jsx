import { useEffect, useState } from "react";
import axios from "axios";

import { useUser } from "../../utils/UserContext";
import Dashboard from "../../components/administrator_page/Dashboard";

const AdminDashboardTab = () => {
  const user = useUser();
  const [salesByStatus, setSalesByStatus] = useState([]);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [ordersOverTime, setOrdersOverTime] = useState([]);
  
  const fetchOrders = async () => {
  try {
    const token = await user.accessToken;
    if (!token) return;

    const res = await axios.get("http://localhost:8000/orders/admin/list/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const orders = res.data.orders || res.data;

    // 1. Total revenue
    const total = orders.reduce(
      (sum, order) => sum + (order.total_price || 0),
      0
    );
    setTotalRevenue(total);
    setOrderCount(orders.length);

    // 2. Sales by status (pie chart)
    const statusCount = {};
    for (const order of orders) {
      const status = order.status || "unknown";
      statusCount[status] = (statusCount[status] || 0) + 1;
    }
    const pieData = Object.entries(statusCount).map(([type, value]) => ({
      type,
      value,
    }));
    setSalesByStatus(pieData);

    // 3. Sales over time (line chart)
    const revenueByMonth = {};
    for (const order of orders) {
      const dateObj = new Date(order.created_at);
      const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // e.g. '2024-05'

      revenueByMonth[yearMonth] = (revenueByMonth[yearMonth] || 0) + (order.total_price || 0);
    }

    const sortedMonths = Object.keys(revenueByMonth).sort();

    const salesOverTime = sortedMonths.map(month => ({
      date: month,       // X-axis will now show '2024-05'
      revenue: revenueByMonth[month],
    }));
    setSalesOverTime(salesOverTime);

    // 4. Order count over time (grouped by date)
    const orderCountByMonth = {};
    for (const order of orders) {
      const dateObj = new Date(order.created_at);
      const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // e.g. '2024-05'

      orderCountByMonth[yearMonth] = (orderCountByMonth[yearMonth] || 0) + 1;
    }


    const ordersOverTime = sortedMonths.map(month => ({
      date: month,
      count: orderCountByMonth[month],
    }));
    setOrdersOverTime(ordersOverTime);

  } catch (err) {
    console.error("Error fetching orders:", err);
  }
};

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return <p>Access denied: Admins only</p>;
  }
  
  console.log(totalRevenue, orderCount);

  return (
    <div style={{ padding: "2rem" }}>
      <Dashboard 
          totalRevenue={totalRevenue} 
          orderCount={orderCount}
          salesByStatus={salesByStatus}
          salesOverTime={salesOverTime}
          ordersOverTime={ordersOverTime}
          />
    </div>
  );
}

export default AdminDashboardTab;