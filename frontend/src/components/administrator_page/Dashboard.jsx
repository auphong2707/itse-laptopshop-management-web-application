import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import { Pie, Line } from "@ant-design/plots";
import axios from "axios";

const Dashboard = ({totalRevenue}) => {
  // Dữ liệu giả cho Pie
  const salesByStatusData = [
    { type: "Shipped", value: 65 },
    { type: "Pending", value: 25 },
    { type: "Cancelled", value: 10 },
  ];

  const lineData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 5000 + 5000),
  }));

  const lineConfig = {
    data: lineData,
    xField: "day",
    yField: "value",
    height: 220,
    smooth: true,
    lineStyle: { stroke: "#1677ff" },
    tooltip: { showMarkers: false },
  };

  const pieConfig = {
    appendPadding: 10,
    data: salesByStatusData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: { type: "spider", labelHeight: 28 },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontWeight: "bold", fontSize: "24px", marginBottom: "2rem" }}>
        Sales Performance Overview
      </h2>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Total Revenue</span>}
              value={totalRevenue}
              prefix="₫"
              valueStyle={{ color: "#1677ff", fontSize: "32px", fontWeight: "bold" }}
            />
            <div style={{ marginTop: "2rem" }} />
            <Statistic
              title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Number of Orders</span>}
              value={321} // Có thể thay bằng orders.length nếu muốn
              valueStyle={{ fontSize: "32px", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sales by Status" style={{ height: "100%" }}>
            <Pie {...pieConfig} height={250} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Card title="Sales Over Time">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Card title="Order Over Time">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;