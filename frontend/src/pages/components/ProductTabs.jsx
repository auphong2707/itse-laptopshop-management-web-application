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
        tabBarStyle={{ borderBottom: "none", paddingBottom: "1rem" }}
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
    </div>
  );
};

export default ProductTabs;
