import React, { useState } from "react";
import { Tabs } from "antd";

const ProductTabs = ({ tabLabels, tabContents }) => {
  const [activeTab, setActiveTab] = useState("0");

  return (
    <div style={{ 
      width: "100%",
      display: "flex", 
      justifyContent: "start", 
      alignItems: "center", 
      padding: "1rem 12%", 
      borderBottom: "2px solid #ddd"
    }}>
      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        tabBarStyle={{borderBottom: "none", paddingBottom: "1rem" }}
        style={{ width: "100%", height: "800px" }}
      >
        {tabLabels.map((label, index) => (
          <Tabs.TabPane 
            key={index.toString()} 
            tab={<span style={{fontWeight: activeTab === index.toString() ? "bold" : "normal" }}>{label}</span>}
          >
            {tabContents[index]}
          </Tabs.TabPane>
        ))}
      </Tabs>

      <div style={{
        position: "absolute",
        top: "179px",
        left: "0",
        width: "100vw", // Dàn toàn màn hình
        height: "1px",  // Độ dày của vạch
        backgroundColor: "#ddd", // Màu gạch dưới
        zIndex: "10", // Đảm bảo nằm trên gạch dưới gốc của Tabs
      }}></div>
    </div>
  );
};

export default ProductTabs;
