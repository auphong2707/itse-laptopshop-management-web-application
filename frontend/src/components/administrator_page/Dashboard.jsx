import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import { Pie, Line } from "@ant-design/plots";
import axios from "axios";

const Dashboard = ({ totalRevenue, orderCount, salesByStatus, salesOverTime, ordersOverTime }) => {
  const salesLineConfig = {
    data: salesOverTime,
    xField: "date",
    yField: "revenue",
    height: 200,
    smooth: true,
    lineStyle: { stroke: "#1677ff", lineWidth: 2 },
    tooltip: { showMarkers: true },
  };
  
  const orderLineConfig = {
    data: ordersOverTime,
    xField: "date",
    yField: "count",
    height: 200,
    smooth: true,
    lineStyle: { stroke: "#1677ff", lineWidth: 2 },
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
      type: "inner",
      content: "{percentage}",
      style: {
        fontWeight: 600,
        fill: "#fff",
      },
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
    legend: { position: "bottom" },
  };

  return (
    <div
      style={{
        padding: "3rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          padding: "2rem",
        }}
      >
        <h2 style={{ fontSize: "50px", fontWeight: "700",marginTop: "0", marginBottom: "2rem", textAlign: "center" }}>
          Sales Performance Overview
        </h2>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={12}>
            <Card
              style={{
                height: 600,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              bordered={false}
            >
              <Statistic
                title={
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000" }}>
                    Total Revenue This Month
                  </span>
                }
                value={totalRevenue}
                prefix="₫"
                valueStyle={{
                  color: "#1677ff",
                  fontSize: "36px",
                  fontWeight: "bold",
                }}
              />
              <div style={{ height: "1.5rem" }} />
              <Statistic
                title={
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000" }}>
                    Number of Orders
                  </span>
                }
                value={orderCount}
                valueStyle={{
                  color: "#1677ff",
                  fontSize: "36px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000" }}>
                    Sales by Status
                  </span>
                } bordered={false} style={{ height: 600 }}>
              <Pie {...pieConfig} style={{ height: 220 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }}>
          <Col span={24}>
            <Card title={
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000" }}>
                    Sales Over Time
                  </span>
                } bordered={false}>
              <Line {...salesLineConfig} />
            </Card>
          </Col>

          <Col span={24}>
            <Card title={
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000" }}>
                    Order Over Time
                  </span>
                } bordered={false}>
              <Line {...orderLineConfig} />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;


