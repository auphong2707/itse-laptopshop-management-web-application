import { Layout, Breadcrumb, Typography, Select, Pagination, Button, Collapse, Checkbox, Divider, Slider, InputNumber } from "antd";
import { useEffect, useState, useMemo, useCallback } from "react";
import WebsiteHeader from "./components/WebsiteHeader";
import WebsiteFooter from "./components/WebsiteFooter";
import styled from "styled-components";	
import ProductCard from "./components/ProductCard";
import { useParams, useSearchParams } from "react-router-dom";
import { transformLaptopData } from "../utils/transformData";
import { debounce } from "lodash";
import axios from "axios";


const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
	height: "100%",
};

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
  { name: "asus", logo: "/brand-logo/asus-logo.png", link: "/laptops/asus" },
  { name: "lenovo", logo: "/brand-logo/lenovo-logo.png", link: "/laptops/lenovo" },
  { name: "acer", logo: "/brand-logo/acer-logo.png", link: "/laptops/acer" },
  { name: "dell", logo: "/brand-logo/dell-logo.png", link: "/laptops/dell" },
  { name: "hp", logo: "/brand-logo/hp-logo.png", link: "/laptops/hp" },
  { name: "msi", logo: "/brand-logo/msi-logo.png", link: "/laptops/msi" }
];

const BrandsSection = () => {
  return (
    <div style={{ width: "100%", textAlign: "center", background: "#F5F7FF", paddingTop: 16, paddingBottom: 1 }}>

		{/* Title */}
		<Text strong style={{ fontSize: 20, display: "block" }}>Brands</Text>

		<br></br>
      
		<CustomButton 
		  type="default" 
		  style={{ width: "90%", height: 40, fontSize: 16, display: "block", margin: "0 auto" }}
		  onClick={() => window.location.href = "/laptops/all"}
		>
		  All brands
		</CustomButton>

		<br></br>

		{/* Grid Container */}
		<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, height: "auto", padding: "0px 1px" }}>
			{brands.map((brand, index) => (
			<div 
				key={index}
				onClick={() => window.location.href = brand.link}
				style={{ 
					display: "flex", 
					justifyContent: "center",
					alignItems: "center",
					background: "white",
					height: 75,
					padding: 15,
					cursor: "pointer"
				}}
			>
				<img 
					src={brand.logo} 
					alt={brand.name} 
					style={{ maxWidth: "100%", filter: "grayscale(100%)" }}
				/>
			</div>
			))}
		</div>
    </div>
  );
};

const subBrands = {
	asus: ["ROG", "TUF", "Zenbook", "Vivobook"],
	lenovo: ["Legion", "LoQ", "ThinkPad", "ThinkBook", "Yoga", "IdeaPad"],
	acer: ["Predator", "Nitro", "Swift", "Aspire"],
	dell: ["Alienware", "G Series", "XPS", "Inspiron", "Latitude", "Precision"],
	hp: ["OMEN", "Victus", "Spectre", "ENVY", "Pavilion", "EliteBook"],
	msi: ["Stealth", "Katana", "Creator", "Modern"],
	all: [
		"ASUS ROG", "ASUS TUF", "ASUS Zenbook", "ASUS Vivobook",
		"Lenovo Legion", "Lenovo LoQ", "Lenovo ThinkPad", "Lenovo ThinkBook", "Lenovo Yoga", "Lenovo IdeaPad",
		"Acer Predator", "Acer Nitro", "Acer Swift", "Acer Aspire",
		"Dell Alienware", "Dell G Series", "Dell XPS", "Dell Inspiron", "Dell Latitude", "Dell Precision",
		"HP OMEN", "HP Victus", "HP Spectre", "HP ENVY", "HP Pavilion", "HP EliteBook",
		"MSI Stealth", "MSI Katana", "MSI Creator", "MSI Modern"
	]
};

const FilterSection = ({ brand, pendingFilters, updatePendingFilters, clearFilters, applyFilters, collapseState, updateCollapseState }) => {
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

	const CheckboxFilter = ({ title, category, options }) => {
		const handleCheckboxChange = (value) => {
			updatePendingFilters({
				selectedFilters: {
					...pendingFilters.selectedFilters,
					[category]: pendingFilters.selectedFilters[category].includes(value)
						? pendingFilters.selectedFilters[category].filter((item) => item !== value)
						: [...pendingFilters.selectedFilters[category], value]
				}
			});
		};

		return (
			<StyledCollapse defaultActiveKey={["1"]} ghost activeKey={collapseState[category] ? ["1"] : []} onChange={() => updateCollapseState(category)}>
				<Panel header={title} key="1" style={{}}>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", height: "auto" }}>
						{options.map((option, index) => (
							<Checkbox
								key={index}
								checked={pendingFilters.selectedFilters[category].includes(option.name)}
								onChange={() => handleCheckboxChange(option.name)}
							>
								<Text style={{ fontSize: "14px" }}>{option.name}</Text>
							</Checkbox>
						))}
					</div>
				</Panel>
			</StyledCollapse>
		);
	};

	const SliderFilter = ({ title, min, max, step = 1, unit, value, onChange, category }) => {
		const [minValue, setMinValue] = useState(value[0]);
		const [maxValue, setMaxValue] = useState(value[1]);
	  
		// Sync external value changes (if value prop updates)
		useEffect(() => {
		  setMinValue(value[0]);
		  setMaxValue(value[1]);
		}, [value]);
	  
		// Debounced callback for smooth updates
		const debouncedOnChange = useCallback(
		  debounce((newValue) => onChange(newValue), 300),
		  []
		);
	  
		// Handle input changes
		const handleMinChange = (val) => {
		  const newMin = Math.max(min, Math.min(val || min, maxValue));
		  setMinValue(newMin);
		  debouncedOnChange([newMin, maxValue]);
		};
	  
		const handleMaxChange = (val) => {
		  const newMax = Math.min(max, Math.max(val || max, minValue));
		  setMaxValue(newMax);
		  debouncedOnChange([minValue, newMax]);
		};
	  
		// Handle smooth slider updates
		const handleSliderChange = (newValue) => {
		  setMinValue(newValue[0]);
		  setMaxValue(newValue[1]);
		  debouncedOnChange(newValue);
		};
	  
		return (
		  <StyledCollapse defaultActiveKey={["1"]} ghost activeKey={collapseState[category] ? ["1"] : []} onChange={() => updateCollapseState(category)}>
			<Panel header={title} key="1">
			  <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
				
				{/* Input Fields for Min and Max */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				  <InputNumber
					min={min}
					max={max}
					value={minValue}
					onChange={handleMinChange}
					formatter={(val) => `${val.toLocaleString()} ${unit}`}
					style={{ width: "40%" }}
				  />
				  <span>—</span>
				  <InputNumber
					min={min}
					max={max}
					value={maxValue}
					onChange={handleMaxChange}
					formatter={(val) => `${val.toLocaleString()} ${unit}`}
					style={{ width: "40%" }}
				  />
				</div>
	  
				{/* Smooth Slider */}
				<Slider
				  range
				  min={min}
				  max={max}
				  step={step}
				  value={[minValue, maxValue]}
				  onChange={handleSliderChange}
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
      
			<Button
				type="default"
				onClick={clearFilters}
				style={{ width: "90%", height: 40, fontSize: 16, display: "block", margin: "0 auto" }}
			>
				Clear Filters
			</Button>

			<div style={{ margin: "0% 5%" }}>
				<Divider style={{ marginBottom: 0, marginRight: 5 }}/>

				{/* Price Filter */}
				<SliderFilter
					title="Price"
					min={3000000}
					max={180000000}
					step={1000000}
					value={pendingFilters.priceRange}
					unit="đ"
					onChange={(value) => updatePendingFilters({ priceRange: value })}
					category="priceRange"
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Sub-brand Filter */}
				<CheckboxFilter
					title="Sub-brand"
					category="subBrand"
					options={subBrands[brand].map((item) => ({ name: item }))}
					handleCheckboxChange={(value) => updatePendingFilters({ subBrand: value })}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Processor Filter */}
				<CheckboxFilter
					title="Processor"
					category="cpu"
					options={[
						{ name: "AMD Ryzen 3" }, { name: "AMD Ryzen 5" }, { name: "AMD Ryzen 7" }, { name: "AMD Ryzen 9" },
						{ name: "Intel Core i3" }, { name: "Intel Core i5" }, { name: "Intel Core i7" }, { name: "Intel Core i9" },
						{ name: "Apple M1" }, { name: "Apple M2" }, { name: "Apple M3" }, { name: "Apple M4" }
					]}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Graphics Card Filter */}
				<CheckboxFilter
					title="Graphics Card"
					category="vga"
					options={[
						{ name: "NVIDIA MX" }, { name: "NVIDIA GTX" }, { name: "NVIDIA RTX 20 Series" },
						{ name: "NVIDIA RTX 30 Series" }, { name: "NVIDIA RTX 40 Series" }, { name: "NVIDIA Quadro" },
						{ name: "AMD Radeon RX 5000M" }, { name: "AMD Radeon RX 6000M" },
						{ name: "AMD Radeon RX 7000M" }, { name: "AMD Radeon Pro" }
					]}
					handleCheckboxChange={(value) => updatePendingFilters({ vga: value })}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>
				
				{/* RAM Amount Filter */}
				<CheckboxFilter
					title="RAM Amount"
					category="ramAmount"
					options={[{ name: "8 GB" }, { name: "16 GB" }, { name: "32 GB" }, { name: "64 GB" }]}
					handleCheckboxChange={(value) => updatePendingFilters({ ramAmount: value })}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Storage Amount Filter */}
				<CheckboxFilter
					title="Storage Amount"
					category="storageAmount"
					options={[{ name: "256 GB" }, { name: "512 GB" }, { name: "1 TB" }]}
					handleCheckboxChange={(value) => updatePendingFilters({ storageAmount: value })}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Screen Size Filter */}
				<CheckboxFilter
					title="Screen Size"
					category="screenSize"
					options={[{ name: "13 inch" }, { name: "14 inch" }, { name: "15 inch" }, { name: "16 inch" }, { name: "17 inch" }]}
					handleCheckboxChange={(value) => updatePendingFilters({ screenSize: value })}
				/>

				<Divider style={{ marginBottom: 0, marginTop: 3 }}/>

				{/* Weight Filter */}
				<SliderFilter
					title="Weight"
					min={0.5}
					max={5}
					step={0.1}
					value={pendingFilters.weightRange}
					unit="kg"
					onChange={(value) => updatePendingFilters({ weightRange: value })}
					category="weightRange"
				/>

			</div>

			<Button 
				type="primary" 
				style={{ width: "90%", height: 40, fontSize: 18, display: "block", margin: "0 auto", borderRadius: 25, fontWeight: "bold" }}
				onClick={applyFilters}
			>
				Apply Filters
			</Button>

		</div>
	);
};

const formatBrand = (brand) => {
	const brandMap = {
		all: "All",
		asus: "ASUS",
		lenovo: "Lenovo",
		acer: "Acer",
		dell: "DELL",
		hp: "HP",
		msi: "MSI"
	};
	return brandMap[brand] || brand;
};

const convertToQueryString = (brand, page, quantityPerPage, filters, sortBy) => {
	let query = `?page=${page}&limit=${quantityPerPage}&brand=${brand}`;

	// Sort By
	if (sortBy === "latest") query += "&sort=latest";
	if (sortBy === "price-low") query += "&sort=price_asc";
	if (sortBy === "price-high") query += "&sort=price_desc";
	if (sortBy === "sale") query += "&sort=sale";

	// Sub-brand
	if (filters.selectedFilters.subBrand.length > 0) {
		filters.selectedFilters.subBrand.forEach((subBrand) => {
			if (brand === "all") {
				subBrand = subBrand.split(" ").slice(1).join(" ");
			}
			subBrand = subBrand.toLowerCase().replace(" ", "+");
			query += `&sub_brand=${subBrand}`;
		})
	}

	// Ram Amount
	if (filters.selectedFilters.ramAmount.length > 0) {
		filters.selectedFilters.ramAmount.forEach((ramAmount) => {
			ramAmount = ramAmount.split(" ")[0];
			query += `&ram_amount=${ramAmount}`;
		})
	}

	// Storage Amount
	if (filters.selectedFilters.storageAmount.length > 0) {
		filters.selectedFilters.storageAmount.forEach((storageAmount) => {
			storageAmount = storageAmount === "1 TB" ? 1024 : storageAmount.split(" ")[0];
			query += `&storage_amount=${storageAmount}`;
		})
	}

	// Screen Size
	if (filters.selectedFilters.screenSize.length > 0) {
		filters.selectedFilters.screenSize.forEach((screenSize) => {
			screenSize = screenSize.split(" ")[0];
			query += `&screen_size=${screenSize}`;
		})
	}

	// CPU
	if (filters.selectedFilters.cpu.length > 0) {
		filters.selectedFilters.cpu.forEach((cpu) => {
			cpu = cpu.startsWith("Apple") ? cpu.split(" ").pop() : cpu.split(" ").slice(-2).join(" ");
			cpu = cpu.toLowerCase().replace(" ", "+");
			query += `&cpu=${cpu}`;
		})
	}

	// VGA
	if (filters.selectedFilters.vga.length > 0) {
		filters.selectedFilters.vga.forEach((vga) => {
			if (vga.includes("NVIDIA MX")) vga = "mx";
			if (vga.includes("NVIDIA GTX")) vga = "gtx";
			if (vga.includes("NVIDIA RTX 20")) vga = "rtx+20";
			if (vga.includes("NVIDIA RTX 30")) vga = "rtx+30";
			if (vga.includes("NVIDIA RTX 40")) vga = "rtx+40";
			if (vga.includes("NVIDIA Quadro")) vga = "quadro";
			if (vga.includes("AMD Radeon RX 5000M")) vga = "rx+5";
			if (vga.includes("AMD Radeon RX 6000M")) vga = "rx+6";
			if (vga.includes("AMD Radeon RX 7000M")) vga = "rx+7";
			if (vga.includes("AMD Radeon Pro")) vga = "rad+pro";
			
			query += `&vga=${vga}`;
		});
	}
	
	// Price Range
	query += `&price_min=${filters.priceRange[0]}&price_max=${filters.priceRange[1]}`;

	// Weight Range
	query += `&weight_min=${filters.weightRange[0]}&weight_max=${filters.weightRange[1]}`;

	return query ? `${query}` : "";
};

const CatalogPage = () => {
	console.log("Rendering CatalogPage");
	const { brand } = useParams();

	const [searchParams, setSearchParams] = useSearchParams();

	// Immediately updating parameters
	const page = parseInt(searchParams.get("page")) || 1;
	const quantityPerPage = parseInt(searchParams.get("quantityPerPage")) || 35;
	const sortBy = searchParams.get("sortBy") || "latest";

	const updateImmediateParams = (params) => {
		const newParams = new URLSearchParams(searchParams);
		Object.keys(params).forEach((key) => {
			newParams.set(key, params[key]);
		});
		setSearchParams(newParams);
	};

	// Applied filters (from URL)
	const appliedFilters = useMemo(() => ({
		priceRange: searchParams.get("priceRange")?.split(",").map(Number) || [3000000, 180000000],
		weightRange: searchParams.get("weightRange")?.split(",").map(Number) || [0.5, 5],
		selectedFilters: {
			subBrand: searchParams.getAll("subBrand"),
			cpu: searchParams.getAll("cpu"),
			vga: searchParams.getAll("vga"),
			ramAmount: searchParams.getAll("ramAmount"),
			storageAmount: searchParams.getAll("storageAmount"),
			screenSize: searchParams.getAll("screenSize")
		}
	}), [searchParams]); 

	// Pending filters (modified but not applied yet)
	const [pendingFilters, setPendingFilters] = useState(appliedFilters);
	
	const updatePendingFilters = (newPendingFilters) => {
		setPendingFilters({ ...pendingFilters, ...newPendingFilters });
	};

	const applyFilters = () => {
		const newParams = new URLSearchParams(searchParams);

		newParams.set("priceRange", pendingFilters.priceRange.join(","));
		newParams.set("weightRange", pendingFilters.weightRange.join(","));
		newParams.delete("page");

		// Remove existing selected filters to avoid duplication
		Object.keys(pendingFilters.selectedFilters).forEach((key) => {
			newParams.delete(key);
			pendingFilters.selectedFilters[key].forEach((value) => {
				newParams.append(key, value);
			});
		});

		setSearchParams(newParams);
	};

	const clearFilters = () => {
		const newParams = new URLSearchParams(searchParams);
	
		// Remove all filter-related parameters
		newParams.delete("priceRange");
		newParams.delete("weightRange");
	
		Object.keys(appliedFilters.selectedFilters).forEach((key) => {
			newParams.delete(key);
		});
	
		// Reset filters in state safely
		setPendingFilters({
			priceRange: [3000000, 180000000],
			weightRange: [0.5, 5],
			selectedFilters: {
				subBrand: [],
				cpu: [],
				vga: [],
				ramAmount: [],
				storageAmount: [],
				screenSize: []
			}
		});
	
		// Reset page to 1 when clearing filters
		newParams.set("page", "1");
	
		// Update the URL
		setSearchParams(newParams);
	};
	

	
	// Data state
	const [products, setProducts] = useState([]);
	const [totalProducts, setTotalProducts] = useState(0);

	const query = convertToQueryString(brand, page, quantityPerPage, appliedFilters, sortBy);

	if (!["all", "asus", "lenovo", "acer", "dell", "hp", "msi"].includes(brand)) {
		return <div>Not Found</div>;
	}

	const formatedBrand = formatBrand(brand);

	// Additional state
	const [collapseState, setCollapseState] = useState({
		priceRange: 1,
		subBrand: 1,
		cpu: 1,
		vga: 1,
		ramAmount: 1,
		storageAmount: 1,
		screenSize: 1,
		weightRange: 1
	});

	const updateCollapseState = (key) => {
		setCollapseState({ ...collapseState, [key]: !collapseState[key] });
	}
	
	useEffect(() => {
		console.log(`http://localhost:8000/laptops/filter${query}`);
		axios.get(`http://localhost:8000/laptops/filter${query}`)
			.then((response) => {
				setTotalProducts(response.data.total_count);
				return response.data.results;
			})
			.then((data) => transformLaptopData(data))
			.then((data) => setProducts(data))
			.catch((error) => console.log(error));
	}, [brand, page, quantityPerPage, sortBy, appliedFilters]);

	let from = (page - 1) * quantityPerPage + 1;
	let to = Math.min(page * quantityPerPage, totalProducts);

	return (
		<Layout>
			<WebsiteHeader />
			<Content className="responsive-padding" style={contentStyle}>
				<img
					src="/catalog_page_advertisement_1.png"
					style={{ width: "100%", height: "auto", display: "block" }}
				/>

				<br></br>

				<Breadcrumb>
					<Breadcrumb.Item>Home</Breadcrumb.Item>
					<Breadcrumb.Item>Laptops</Breadcrumb.Item>
					<Breadcrumb.Item>{formatedBrand}</Breadcrumb.Item>
				</Breadcrumb>

				<Title level={1}>{formatedBrand} Laptop</Title>

				<br></br>

				<div style={{display: "flex", flexDirection: "row", gap: 10}}>
					<div style={{width: 260, backgroundColor: "white"}}>
						<BrandsSection />
						<br></br>
						<FilterSection 
							brand={brand}
							pendingFilters={pendingFilters}
							updatePendingFilters={updatePendingFilters}
							clearFilters={clearFilters}
							applyFilters={applyFilters}
							collapseState={collapseState}
							updateCollapseState={updateCollapseState}
						/>
					</div>

					<div style={{width: "100%", backgroundColor: "white" }}>
						<div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Text type="secondary">Items {from}-{to} of {totalProducts}</Text>

							<div style={{ display: "flex", gap: 10 }}>
								<CustomSelect 
									value={sortBy} 
									onChange={(value) => {updateImmediateParams({ sortBy: value, page: 1 })}}
									style={{ width: 250, height: 50 }}
								>
									<Option value="latest">
										<Text type="secondary" strong>Sort by: </Text>
										<Text strong> Latest</Text>
									</Option>
									<Option value="price-low">
										<Text type="secondary" strong>Sort by: </Text>
										<Text strong> Price (Low to High)</Text>
									</Option>
									<Option value="price-high">
										<Text type="secondary" strong>Sort by: </Text>
										<Text strong> Price (High to Low)</Text>
									</Option>
								</CustomSelect>

								<CustomSelect
									defaultValue={{ value: quantityPerPage }}
									style={{ width: 180, height: 50 }} 
									onChange={(value) => {updateImmediateParams({ quantityPerPage: value, page: 1 })}}
								>
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

						<Pagination 
							align="center"
							current={page}
							onChange={(page) => {updateImmediateParams("page", page)}}
							total={totalProducts}
							pageSize={quantityPerPage}
							showSizeChanger={false}
						/>
					</div>
				</div>
			</Content>

			<WebsiteFooter />
		</Layout>
	);
}

export default CatalogPage;