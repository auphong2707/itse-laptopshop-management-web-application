import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import { Pie, Line } from "@ant-design/plots";
import axios from "axios";

const Dashboard = ({totalRevenue, orderCount, salesByStatus, salesOverTime, ordersOverTime}) => {

  const salesLineConfig = {
  data: salesOverTime,
  xField: "date",
  yField: "revenue",
  height: 220,
  smooth: true,
  lineStyle: { stroke: "#52c41a" },
  tooltip: { showMarkers: true },
};

const orderLineConfig = {
  data: ordersOverTime,
  xField: "date",
  yField: "count",
  height: 220,
  smooth: true,
  lineStyle: { stroke: "#fa541c" }, // Use a different color from revenue
  tooltip: {
    formatter: (datum) => ({
      name: "Orders",
      value: `${datum.count} orders`,
    }),
  },
};



  const pieConfig = {
    appendPadding: 10,
    data: salesByStatus,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: "outer", // ← instead of "spider"
      content: '{name} ({percentage})',
      style: {
        fontWeight: 500,
      },
    },
    interactions: [
      { type: "element-selected" },
      { type: "element-active" }
    ],
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
              value={orderCount} 
              valueStyle={{ fontSize: "32px", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sales by Status" style={{ height: "100%" }}>
            <Pie {...pieConfig} style={{height:250}} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Card title="Sales Over Time">
            <Line {...salesLineConfig} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Card title="Order Over Time">
            <Line {...orderLineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;