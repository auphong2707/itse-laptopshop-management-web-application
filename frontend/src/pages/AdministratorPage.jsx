import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Upload, Row, Col, Layout, Typography, Breadcrumb, Tabs } from "antd";
import { Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";

const { Content } = Layout;
const { Title } = Typography;

const RequiredLabel = ({ label }) => (
	<span style={{ fontWeight: "bold" }}>
	  {label}<span style={{ color: "red", marginLeft: 4 }}>*</span>
	</span>
  );
  
  const OptionalLabel = ({ label }) => (
	<span style={{ fontWeight: "bold" }}>{label}</span>
  );

  const AddingProducts = () => {
	const [form] = Form.useForm();

	const inputStyle = { width: "60%" };
	const sectionTitleStyle = { fontSize: "20px", fontWeight: "bold", marginTop: "2rem" };

	return (
	  <div style={{ padding: "2rem 0" }}>
		<Form 
			layout="horizontal" 
			form={form}
			labelCol={{ span: 4 }}
			wrapperCol={{ span: 20 }}
			labelAlign="left"
			colon={false}
		>
			{/* Flex Container chính */}
			<div style={{ display: "flex", gap: "2rem" }}>

				{/* Phần bên trái: Form fields */}
				<div style={{ flex: 2 }}>

					{/* General Information */}
					<h3 style={sectionTitleStyle}>General Information</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="Brand" />} name="brand">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Name" />} name="name">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Operating System" />} name="operatingSystem">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Warranty" />} name="warranty">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Performance */}
					<h3 style={sectionTitleStyle}>Performance</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="CPU" />} name="cpu">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="GPU" />} name="gpu">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="RAM" />} name="ram">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Storage" />} name="storage">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Display */}
					<h3 style={sectionTitleStyle}>Display</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="Size" />} name="size">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Resolution" />} name="resolution">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Refresh Rate" />} name="refreshRate">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Brightness" />} name="brightness">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Battery and Power */}
					<h3 style={sectionTitleStyle}>Battery and Power</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="Battery Capacity" />} name="batteryCapacity">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Battery Cells" />} name="batteryCells">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Physical Dimensions and Weight */}
					<h3 style={sectionTitleStyle}>Physical Dimensions and Weight</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="Width" />} name="width">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Depth" />} name="depth">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Height" />} name="height">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Weight" />} name="weight">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Connectivity and Ports */}
					<h3 style={sectionTitleStyle}>Connectivity and Ports</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="USB-A Ports" />} name="usbAPorts">
						<InputNumber min={0} style={{ width: "60px", fontWeight: "bold", backgroundColor: "#d9d9d9" }} />
					</Form.Item>
					<Form.Item label={<RequiredLabel label="USB-C Ports" />} name="usbCPorts" rules={[{ required: false }]}>
					<InputNumber
						min={0}
						controls={true}
						style={{
						width: "60px",
						fontWeight: "bold",
						borderRadius: "4px",
						backgroundColor: "#d9d9d9",
						padding: "4px",
						textAlign: "center",
						}}
					/>
					</Form.Item>

					<Form.Item label={<RequiredLabel label="HDMI Ports" />} name="hdmiPorts" rules={[{ required: false }]}>
					<InputNumber
						min={0}
						controls={true}
						style={{
						width: "60px",
						fontWeight: "bold",
						borderRadius: "4px",
						backgroundColor: "#d9d9d9",
						padding: "4px",
						textAlign: "center",
						}}
					/>
					</Form.Item>

					<Form.Item label={<RequiredLabel label="Ethernet Ports" />} name="ethernetPorts" rules={[{ required: false }]}>
					<InputNumber
						min={0}
						controls={true}
						style={{
						width: "60px",
						fontWeight: "bold",
						borderRadius: "4px",
						backgroundColor: "#d9d9d9",
						padding: "4px",
						textAlign: "center",
						}}
					/>
					</Form.Item>

					<Form.Item label={<RequiredLabel label="Audio Jacks" />} name="audioJacks" rules={[{ required: false }]}>
					<InputNumber
						min={0}
						controls={true}
						style={{
						width: "60px",
						fontWeight: "bold",
						borderRadius: "4px",
						backgroundColor: "#d9d9d9",
						padding: "4px",
						textAlign: "center",
						}}
					/>
					</Form.Item>

					{/* Other features */}
					<h3 style={sectionTitleStyle}>Other features</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<OptionalLabel label="Webcam" />} name="webcam">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Price */}
					<h3 style={sectionTitleStyle}>Price</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
					</div>
					<Form.Item label={<RequiredLabel label="Price" />} name="price">
						<InputNumber suffix="đ" style={inputStyle}/>
					</Form.Item>

					{/* Submit button */}
					<Form.Item wrapperCol={{ offset: 4 }}>
						<Button type="primary">Submit</Button>
					</Form.Item>
				</div>

				{/* Phần bên phải: Upload Pictures */}
				<div style={{ flex: 1, textAlign: "center", marginTop: "4rem" }}>
					<h3 style={sectionTitleStyle}>Add pictures</h3>
					<div style={{ width: "100%" }}>
						<Divider style={{ margin: "8px auto 24px auto", borderTopWidth: "2px" }} />
					</div>
					<Form.Item name="pictures">
						<Upload action="/upload" listType="picture-card">
							<div style={{ fontSize: "64px", padding: "80px 60px" }}>
								<PlusOutlined />
								<div style={{ marginTop: 12, fontSize: "18px" }}>Upload images</div>
							</div>
						</Upload>
					</Form.Item>
				</div>
			</div>
		</Form>
	  </div>
	);
};


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
				style={{ width: "100%" }}
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
				top: "300px",
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

      <Content style={{ padding: "1.5rem 12%", backgroundColor: "#fff" }}>
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
