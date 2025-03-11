import { Layout, Breadcrumb, Typography, Select, Pagination, Button, Collapse, Checkbox, Divider, Slider, InputNumber } from "antd";
import { useState } from "react";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import styled from "styled-components";	
import ProductCard from "./components/ProductCard";


const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
	height: "100%",
};

const products = new Array(35).fill({
	productName: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-in-One",
	originalPrice: 599.00,
	salePrice: 499.00,
	rate: 4,
	numRate: 20,
	inStock: true,
	imgSource: "https://via.placeholder.com/150", // Replace with actual image
});

const CustomSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 0 !important;
		border-width: 3px !important;
  }
`;

const CustomButton = styled(Button)`
  border-radius: 25px;
  border: 2px solid #b0b3b8;
  font-weight: bold;
	color: grey;
  
  &:hover,
  &:focus {
    border-color: #868e96;
    background: #F5F7FF;
  }
`;


const brands = [
  { name: "asus", logo: "./public/brand-logo/asus-logo.png" },
  { name: "lenovo", logo: "./public/brand-logo/lenovo-logo.png" },
  { name: "acer", logo: "./public/brand-logo/acer-logo.png" },
  { name: "dell", logo: "./public/brand-logo/dell-logo.png" },
  { name: "hp", logo: "./public/brand-logo/hp-logo.png" },
  { name: "msi", logo: "./public/brand-logo/msi-logo.png" },
];

const BrandsSection = () => {
  return (
    <div style={{ width: "100%", textAlign: "center", background: "#F5F7FF", paddingTop: 16, paddingBottom: 1 }}>

			{/* Title */}
			<Text strong style={{ fontSize: 20, display: "block" }}>Brands</Text>

			<br></br>
      
      {/* Button */}
      <CustomButton type="default" style={{ width: "90%", height: 40, fontSize: 16, display: "block", margin: "0 auto" }}>
        All brands
      </CustomButton>

			<br></br>

      {/* Grid Container */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, height: "auto", padding: "0px 1px" }}>
        {brands.map((brand, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "white", height: 75, padding: 15 }}>
            <img src={brand.logo} alt={brand.name} style={{ maxWidth: "100%", filter: "grayscale(100%)" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterSection = () => {
	const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-weight: bold;
    font-size: 16px;
		text-align: left;
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
  }
	.ant-collapse-content-box {
		padding-top: 0
	}
	.ant-collapse-content {
		border: none;
		padding-top: 0;
	}
	`;

	const CheckboxFilter = ({ title, options }) => {
		return (
			<StyledCollapse defaultActiveKey={["1"]} ghost>
				<Panel header={title} key="1" style={{}}>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", height: "auto" }}>
						{options.map((option, index) => (
							<Checkbox
								key={index}
							>
								<Text style={{ fontSize: "14px" }}>{option.name}</Text>
							</Checkbox>
						))}
					</div>
				</Panel>
			</StyledCollapse>
		);
	};
	
	const StyledInput = styled(InputNumber)`
		width: 100px;
		text-align: center;
		border-radius: 6px;
		border: 1px solid #d9d9d9;
	`;

	const SliderFilter = ({ title, min, max, step, unit, value, onChange }) => {
		return (
			<StyledCollapse defaultActiveKey={["1"]} ghost>
				<Panel header={title} key="1">
					<div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", height: "auto" }}>
						
						{/* Input Fields for Min and Max Values */}
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<StyledInput
								min={min}
								max={max}
								value={value[0]}
								onChange={(val) => onChange([val || min, value[1]])}
								formatter={(val) => `${val.toLocaleString()} ${unit}`}
							/>
							<span>—</span>
							<StyledInput
								min={min}
								max={max}
								value={value[1]}
								onChange={(val) => onChange([value[0], val || max])}
								formatter={(val) => `${val.toLocaleString()} ${unit}`}
							/>
						</div>
	
						{/* Slider Component */}
						<Slider
							range
							min={min}
							max={max}
							step={step}
							value={value}
							onChange={onChange}
						/>
	
					</div>
				</Panel>
			</StyledCollapse>
		);
	};

	return (
		<div style={{ width: 260, textAlign: "center", background: "#F5F7FF", paddingTop: 16, paddingBottom: 10 }}>
			
			{/* Title */}
			<Text strong style={{ fontSize: 20, display: "block" }}>Filters</Text>

			<br></br>
      
      {/* Button */}
      <CustomButton type="default" style={{ width: "90%", height: 40, fontSize: 16, display: "block", margin: "0 auto" }}>
        Clear Filters
      </CustomButton>

			<div style={{ margin: "0% 5%" }}>
				<Divider style={{ marginBottom: 0, marginRight: 5 }}/>

				{/* Filter by Price */}
				<SliderFilter
					title="Price"
					min={5000000}
					max={180000000}
					step={1000000}
					value={[5000000, 180000000]}
					unit="đ"
					onChange={(value) => console.log(value)}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by Sub-brand */}
				<CheckboxFilter
					title="Sub-brand"
					options={[
						{ name: "ROG" },
						{ name: "TUF" },
						{ name: "ZENBOOK" },
						{ name: "VIVOBOOK" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by Processor */}
				<CheckboxFilter
					title="Processor"
					options={[
						{ name: "AMD Ryzen 3" },
						{ name: "AMD Ryzen 5" },
						{ name: "AMD Ryzen 7" },
						{ name: "AMD Ryzen 9" },
						{ name: "Intel Core i3" },
						{ name: "Intel Core i5" },
						{ name: "Intel Core i7" },
						{ name: "Intel Core i9" },
						{ name: "Apple M1" },
						{ name: "Apple M2" },
						{ name: "Apple M3" },
						{ name: "Apple M4" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by VGA */}
				<CheckboxFilter
					title="Graphics Card"
					options={[
						{ name: "NVIDIA MX" },
						{ name: "NVIDIA GTX" },
						{ name: "NVIDIA RTX 20 Series" },
						{ name: "NVIDIA RTX 30 Series" },
						{ name: "NVIDIA RTX 40 Series" },
						{ name: "NVIDIA Quadro" },
						{ name: "AMD Radeon RX 5000M" },
						{ name: "AMD Radeon RX 6000M" },
						{ name: "AMD Radeon RX 7000M" },
						{ name: "AMD Radeon Pro" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>
				
				{/* Filter by RAM Amount */}
				<CheckboxFilter
					title="RAM Amount"
					options={[
						{ name: "8 GB" },
						{ name: "16 GB" },
						{ name: "32 GB" },
						{ name: "64 GB" },
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by Storage Amount */}
				<CheckboxFilter
					title="Storage Amount"
					options={[
						{ name: "256 GB" },
						{ name: "512 GB" },
						{ name: "1 TB" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by Screen Size */}
				<CheckboxFilter
					title="Screen Size"
					options={[
						{ name: "13 inch" },
						{ name: "14 inch" },
						{ name: "15 inch" },
						{ name: "16 inch" },
						{ name: "17 inch" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Filter by Weight */}
				<SliderFilter
					title="Weight"
					min={0.5}
					max={5}
					step={0.1}
					value={[0.5, 5]}
					unit="kg"
					onChange={(value) => console.log(value)}
				/>

			</div>

			<Button type="primary" style={{ width: "90%", height: 40, fontSize: 18, display: "block", margin: "0 auto", borderRadius: 25, fontWeight: "bold" }}>
				Apply Filters
			</Button>

		</div>
	);
};


const CatalogPage = ({ inputBrand }) => {
	const [brand, setBrand] = useState(inputBrand);

	return (
		<Layout>
			<WebsiteHeader />
			<Content className="responsive-padding" style={contentStyle}>
				<img
					src="https://via.placeholder.com/1920x400"
					style={{ width: "100%", height: "100px", display: "block" }}
				/>

				<br></br>

				<Breadcrumb>
					<Breadcrumb.Item>Home</Breadcrumb.Item>
					<Breadcrumb.Item>Laptops</Breadcrumb.Item>
					<Breadcrumb.Item>Everyday Use Notebooks</Breadcrumb.Item>
					<Breadcrumb.Item>MSI Prestige Series</Breadcrumb.Item>
					<Breadcrumb.Item style={{ color: "#d9d9d9", cursor: "default" }}>
						MSI WS Series
					</Breadcrumb.Item>
				</Breadcrumb>

				<Title level={1}>{brand} Laptop</Title>

				<br></br>

				<div style={{display: "flex", flexDirection: "row", gap: 10}}>
					<div style={{width: 260, backgroundColor: "white"}}>
						<BrandsSection />
						<br></br>
						<FilterSection />
					</div>

					<div style={{width: "100%", backgroundColor: "white" }}>
						<div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Text type="secondary">Items 1-35 of 61</Text>

							<div style={{ display: "flex", gap: 10 }}>
								<CustomSelect defaultValue={"position"} style={{ width: 180, height: 50 }} >
									<Option value="position">
											<Text type="secondary" strong>Sort by: </Text>
											<Text strong> Position</Text>
									</Option>
									<Option value="price">
											<Text type="secondary" strong>Sort by: </Text>
											<Text strong> Price</Text>
									</Option>
								</CustomSelect>

								<CustomSelect defaultValue={35} style={{ width: 180, height: 50 }}>
									<Option value={15}>
										<Text type="secondary" strong>Show: </Text>
										<Text strong>15 per page</Text>
									</Option>
									<Option value={35}>
										<Text type="secondary" strong>Show: </Text>
										<Text strong>35 per page</Text>
									</Option>
								</CustomSelect>
							</div>
						</div>

						<div className="grid-division">
							{products.map((product, index) => (
								<ProductCard {...product} />
							))}
						</div>

						<br></br>

						<Pagination align="center" defaultCurrent={1} total={1400} pageSize={35} showSizeChanger={false}/>
					</div>
				</div>
			</Content>

			<WebsiteFooter />
		</Layout>
	);
}

export default CatalogPage;