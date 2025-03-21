import React, { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { Form, Input, InputNumber, Button, Layout, Typography, Breadcrumb, Tabs } from "antd";
import { Divider } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";

const { Content } = Layout;
const { Title } = Typography;

const sectionTitleStyle = { fontSize: "20px", fontWeight: "bold", marginTop: "2rem" };

const CustomDivider = ({ label }) => (
	<>
		<h3 style={sectionTitleStyle}>{label}</h3>
		<div style={{ width: "50%" }}>
			<Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
		</div>
	</>
);

const RequiredLabel = ({ label }) => (
	<span style={{ fontWeight: "bold" }}>
	  {label}<span style={{ color: "red", marginLeft: 4 }}>*</span>
	</span>
);
  
const OptionalLabel = ({ label }) => (
	<span style={{ fontWeight: "bold" }}>{label}</span>
);

const Detail = () => {
	const [form] = Form.useForm();

	const [pictures, setPictures] = useState([]);

  	const handleAddPicture = (event) => {
		const file = event.target.files[0];
		if (file) {
			const newPicture = URL.createObjectURL(file);
			setPictures((prev) => [...prev, newPicture]);
		}
	};

	const inputStyle = { width: "40%" };

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
					<CustomDivider label="General Information" />
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
					<CustomDivider label="Performance" />
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
					<CustomDivider label="Display" />
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
					<CustomDivider label="Battery and Power" />
					<Form.Item label={<RequiredLabel label="Battery Capacity" />} name="batteryCapacity">
						<Input style={inputStyle}/>
					</Form.Item>
					<Form.Item label={<RequiredLabel label="Battery Cells" />} name="batteryCells">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Physical Dimensions and Weight */}
					<CustomDivider label="Physical Dimensions and Weight" />
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
					<CustomDivider label="Connectivity and Ports" />
					<Form.Item label={<RequiredLabel label="USB-A Ports" />} name="usbAPorts">
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
					<CustomDivider label="Other features" />
					<Form.Item label={<OptionalLabel label="Webcam" />} name="webcam">
						<Input style={inputStyle}/>
					</Form.Item>

					{/* Price */}
					<CustomDivider label="Price" />
					<Form.Item label={<RequiredLabel label="Price" />} name="price">
						<InputNumber suffix="đ" style={inputStyle}/>
					</Form.Item>

					{/* Submit button */}
					<Form.Item wrapperCol={{ offset: 4 }}>
						<Button type="primary">Submit</Button>
					</Form.Item>
				</div>

				<div style={{ position: "absolute", right: "-5px", top: "120px", flex: 1 }}>

				<Form.Item name="pictures">
					<Swiper
					modules={[Navigation]}
					navigation
					spaceBetween={40}
					slidesPerView={1}
					style={{ width: '650px', height: '400px', padding: '1rem'}}
				>
					{pictures.map((picture, index) => (
					<SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<img
						src={picture}
						alt={`Picture ${index + 1}`}
						style={{ width: '600px', height: '400px' }}
						/>
					</SwiperSlide>
					))}
					<SwiperSlide style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<label style={{ cursor: 'pointer', padding: '20px', border: '2px dashed #aaa', borderRadius: '8px' }}>
						Add picture
						<input
						type="file"
						accept="image/*"
						style={{ display: 'none' }}
						onChange={handleAddPicture}
						/>
					</label>
					</SwiperSlide>
				</Swiper>
				</Form.Item>

				</div>
			</div>
		</Form>
	  </div>
	);
};


const DeletingProducts = () => {
	const products = [
	  { id: 1, name: "TEN MAY TINH", image: "path/to/image1.jpg" },
	  { id: 2, name: "TEN MAY TINH", image: "path/to/image2.jpg" }
	];
  
	return (
	  <div style={{ padding: "2rem 0" }}>
		<input 
		  type="text" 
		  placeholder="Search for item" 
		  style={{
			width: "50%",
			padding: "0.5rem",
			marginBottom: "1rem",
			border: "1px solid #ddd",
			borderRadius: "12px"
		  }}
		/>
		{products.map((product) => (
		  <div
			key={product.id}
			style={{
			  display: "flex",
			  alignItems: "center",
			  padding: "1rem",
			  borderBottom: "1px solid #ddd",
			  width: "50%"
			}}
		  >
			<img
			  src={product.image}
			  alt={product.name}
			  style={{
				width: "80px",
				height: "80px",
				objectFit: "cover",
				marginRight: "1rem"
			  }}
			/>
			<span style={{ flexGrow: 1, fontWeight: "bold", marginRight: "0.5rem" }}>
			  {product.name}
			</span>
			<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			  <button
				style={{
				  width: "32px",
				  height: "32px",
				  borderRadius: "50%",
				  border: "none",
				  background: "#f5f5f5",
				  cursor: "pointer",
				  color: "#a6a6a6",
				  display: "flex",
				  alignItems: "center",
				  justifyContent: "center",
				  transition: "background-color 0.3s, transform 0.3s"
				}}
				onMouseEnter={(e) => {
				  e.currentTarget.style.backgroundColor = "#ddd";
				  e.currentTarget.style.transform = "scale(1.1)";
				  e.currentTarget.style.color = "#595959";
				}}
				onMouseLeave={(e) => {
				  e.currentTarget.style.backgroundColor = "#f5f5f5";
				  e.currentTarget.style.transform = "scale(1)";
				  e.currentTarget.style.color = "#a6a6a6";
				}}
			  >
				<CloseOutlined />
			  </button>
  
			  <button
				style={{
				  width: "32px",
				  height: "32px",
				  borderRadius: "50%",
				  border: "none",
				  background: "#f5f5f5",
				  cursor: "pointer",
				  color: "#a6a6a6",
				  display: "flex",
				  alignItems: "center",
				  justifyContent: "center",
				  transition: "background-color 0.3s, transform 0.3s"
				}}
				onMouseEnter={(e) => {
				  e.currentTarget.style.backgroundColor = "#ddd";
				  e.currentTarget.style.transform = "scale(1.1)";
				  e.currentTarget.style.color = "#595959";
				}}
				onMouseLeave={(e) => {
				  e.currentTarget.style.backgroundColor = "#f5f5f5";
				  e.currentTarget.style.transform = "scale(1)";
				  e.currentTarget.style.color = "#a6a6a6";
				}}
			  >
				<EditOutlined />
			  </button>
			</div>
		  </div>
		))}
	  </div>
	);
  };

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
				 tabLabels={["Detail", "Deleting products"]}
				 tabContents = {[
					Detail(),
					DeletingProducts(),
					]}
				/>
      </Content>

      <WebsiteFooter />
    </Layout>
  );
};

export default AdministratorPage;
