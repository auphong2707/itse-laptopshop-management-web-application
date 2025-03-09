import React, { useState } from "react";
import { Layout, Typography, Breadcrumb, Tabs } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";

const { Content } = Layout;
const { Title } = Typography;

const AddingProducts = () => (
	<div>

	</div>
);

const DeletingProducts = () => (
	<div>
		
	</div>
);

const Details = () => (
	<div>

	</div>
);

const AdminTabs = ({ tabLabels, tabContents }) => {
	const [activeTab, setActiveTab] = useState("0");

	return (
		<div style={{ 
			width: "100%",
			display: "flex", 
			justifyContent: "start", 
			alignItems: "center", 
			padding: "0.75rem 0%", 
			borderBottom: "2px solid #ddd"
		}}>
			<Tabs
				activeKey={activeTab}
				onChange={(key) => setActiveTab(key)}
				tabBarGutter={80}
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
				top: "306px",
				left: "0",
				width: "100vw",
				height: "1px", 
				backgroundColor: "#ddd", 
				zIndex: "10",
			}}></div>
		</div>
	);
};

const AdministratorPage = () => {

  return (
    <Layout>
      <WebsiteHeader />

      <Content style={{ padding: "1.5rem 10%", backgroundColor: "#fff" }}>
        <Breadcrumb separator=">" style={{ marginBottom: "1rem", fontSize: "14px" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Administrator Page</Breadcrumb.Item>
        </Breadcrumb>

        {/* Page title */}
        <Title level={2} style={{ fontWeight: "bold" }}>Administrator page</Title>

        {/* Tabs Section */}
        <AdminTabs
				 tabLabels={["Adding products", "Deleting products", "Details"]}
				 tabContents = {[
					AddingProducts(),
					DeletingProducts(),
					Details(),
					]}
				/>
      </Content>

      <WebsiteFooter />
    </Layout>
  );
};

export default AdministratorPage;
