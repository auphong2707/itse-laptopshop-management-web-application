import { Layout, Breadcrumb, Typography, Select, Pagination } from "antd";
import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import BrandsSection from "../components/BrandsSection";
import FilterSection from "../components/FilterSection";
import ProductCard from "../components/ProductCard";
import { transformLaptopData } from "../utils/transformData";


const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const contentStyle = {
  color: "#fff",
  backgroundColor: "white",
  height: "100%",
};

const CustomSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 0 !important;
    border-width: 3px !important;
  }
`;

const brands = [
  { name: "asus", logo: "/brand-logo/asus-logo.png", link: "/laptops/asus" },
  {
    name: "lenovo",
    logo: "/brand-logo/lenovo-logo.png",
    link: "/laptops/lenovo",
  },
  { name: "acer", logo: "/brand-logo/acer-logo.png", link: "/laptops/acer" },
  { name: "dell", logo: "/brand-logo/dell-logo.png", link: "/laptops/dell" },
  { name: "hp", logo: "/brand-logo/hp-logo.png", link: "/laptops/hp" },
  { name: "msi", logo: "/brand-logo/msi-logo.png", link: "/laptops/msi" },
];

const subBrands = {
  asus: ["ROG", "TUF", "Zenbook", "Vivobook"],
  lenovo: ["Legion", "LoQ", "ThinkPad", "ThinkBook", "Yoga", "IdeaPad"],
  acer: ["Predator", "Nitro", "Swift", "Aspire"],
  dell: ["Alienware", "G Series", "XPS", "Inspiron", "Latitude", "Precision"],
  hp: ["OMEN", "Victus", "Spectre", "ENVY", "Pavilion", "EliteBook"],
  msi: ["Stealth", "Katana", "Creator", "Modern"],
  all: [
    "ASUS ROG",
    "ASUS TUF",
    "ASUS Zenbook",
    "ASUS Vivobook",
    "Lenovo Legion",
    "Lenovo LoQ",
    "Lenovo ThinkPad",
    "Lenovo ThinkBook",
    "Lenovo Yoga",
    "Lenovo IdeaPad",
    "Acer Predator",
    "Acer Nitro",
    "Acer Swift",
    "Acer Aspire",
    "Dell Alienware",
    "Dell G Series",
    "Dell XPS",
    "Dell Inspiron",
    "Dell Latitude",
    "Dell Precision",
    "HP OMEN",
    "HP Victus",
    "HP Spectre",
    "HP ENVY",
    "HP Pavilion",
    "HP EliteBook",
    "MSI Stealth",
    "MSI Katana",
    "MSI Creator",
    "MSI Modern",
  ],
};

const formatBrand = (brand) => {
  const brandMap = {
    all: "All",
    asus: "ASUS",
    lenovo: "Lenovo",
    acer: "Acer",
    dell: "DELL",
    hp: "HP",
    msi: "MSI",
  };
  return brandMap[brand] || brand;
};

const convertToQueryString = (
  brand,
  page,
  quantityPerPage,
  filters,
  sortBy,
) => {
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
    });
  }

  // Ram Amount
  if (filters.selectedFilters.ramAmount.length > 0) {
    filters.selectedFilters.ramAmount.forEach((ramAmount) => {
      ramAmount = ramAmount.split(" ")[0];
      query += `&ram_amount=${ramAmount}`;
    });
  }

  // Storage Amount
  if (filters.selectedFilters.storageAmount.length > 0) {
    filters.selectedFilters.storageAmount.forEach((storageAmount) => {
      storageAmount =
        storageAmount === "1 TB" ? 1024 : storageAmount.split(" ")[0];
      query += `&storage_amount=${storageAmount}`;
    });
  }

  // Screen Size
  if (filters.selectedFilters.screenSize.length > 0) {
    filters.selectedFilters.screenSize.forEach((screenSize) => {
      screenSize = screenSize.split(" ")[0];
      query += `&screen_size=${screenSize}`;
    });
  }

  // CPU
  if (filters.selectedFilters.cpu.length > 0) {
    filters.selectedFilters.cpu.forEach((cpu) => {
      cpu = cpu.startsWith("Apple")
        ? cpu.split(" ").pop()
        : cpu.split(" ").slice(-2).join(" ");
      cpu = cpu.toLowerCase().replace(" ", "+");
      query += `&cpu=${cpu}`;
    });
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
  const appliedFilters = useMemo(
    () => ({
      priceRange: searchParams.get("priceRange")?.split(",").map(Number) || [
        3000000, 180000000,
      ],
      weightRange: searchParams.get("weightRange")?.split(",").map(Number) || [
        0.5, 5,
      ],
      selectedFilters: {
        subBrand: searchParams.getAll("subBrand"),
        cpu: searchParams.getAll("cpu"),
        vga: searchParams.getAll("vga"),
        ramAmount: searchParams.getAll("ramAmount"),
        storageAmount: searchParams.getAll("storageAmount"),
        screenSize: searchParams.getAll("screenSize"),
      },
    }),
    [searchParams],
  );

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
        screenSize: [],
      },
    });

    // Reset page to 1 when clearing filters
    newParams.set("page", "1");

    // Update the URL
    setSearchParams(newParams);
  };

  // Data state
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const query = convertToQueryString(
    brand,
    page,
    quantityPerPage,
    appliedFilters,
    sortBy,
  );

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
    weightRange: 1,
  });

  const updateCollapseState = (key) => {
    setCollapseState({ ...collapseState, [key]: !collapseState[key] });
  };

  useEffect(() => {
    console.log(`http://localhost:8000/laptops/filter${query}`);
    axios
      .get(`http://localhost:8000/laptops/filter${query}`)
      .then((response) => {
        setTotalProducts(response.data.total_count);
        return response.data.results;
      })
      .then((data) => transformLaptopData(data))
      .then((data) => setProducts(data))
      .catch((error) => console.log(error));
  }, [brand, page, quantityPerPage, sortBy, appliedFilters]);

  const from = (page - 1) * quantityPerPage + 1;
  const to = Math.min(page * quantityPerPage, totalProducts);

  return (
    <Layout>
      <WebsiteHeader />
      <Content className="responsive-padding" style={contentStyle}>
        <img
          src="/catalog_page_advertisement_1.png"
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        <br></br>

        <Breadcrumb separator=">" style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/laptops/all">Laptops</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{formatedBrand}</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={1}>{formatedBrand} Laptop</Title>

        <br></br>

        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <div style={{ width: 260, backgroundColor: "white" }}>
            <BrandsSection brands={brands} />
            <br></br>
            <FilterSection
              brand={brand}
              subBrands={subBrands}
              pendingFilters={pendingFilters}
              updatePendingFilters={updatePendingFilters}
              clearFilters={clearFilters}
              applyFilters={applyFilters}
              collapseState={collapseState}
              updateCollapseState={updateCollapseState}
            />
          </div>

          <div style={{ width: "100%", backgroundColor: "white" }}>
            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text type="secondary">
                Items {from}-{to} of {totalProducts}
              </Text>

              <div style={{ display: "flex", gap: 10 }}>
                <CustomSelect
                  value={sortBy}
                  onChange={(value) => {
                    updateImmediateParams({ sortBy: value, page: 1 });
                  }}
                  style={{ width: 250, height: 50 }}
                >
                  <Option value="latest">
                    <Text type="secondary" strong>
                      Sort by:{" "}
                    </Text>
                    <Text strong> Latest</Text>
                  </Option>
                  <Option value="price-low">
                    <Text type="secondary" strong>
                      Sort by:{" "}
                    </Text>
                    <Text strong> Price (Low to High)</Text>
                  </Option>
                  <Option value="price-high">
                    <Text type="secondary" strong>
                      Sort by:{" "}
                    </Text>
                    <Text strong> Price (High to Low)</Text>
                  </Option>
                </CustomSelect>

                <CustomSelect
                  defaultValue={{ value: quantityPerPage }}
                  style={{ width: 180, height: 50 }}
                  onChange={(value) => {
                    updateImmediateParams({ quantityPerPage: value, page: 1 });
                  }}
                >
                  <Option value={15}>
                    <Text type="secondary" strong>
                      Show:{" "}
                    </Text>
                    <Text strong>15 per page</Text>
                  </Option>
                  <Option value={35}>
                    <Text type="secondary" strong>
                      Show:{" "}
                    </Text>
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
              onChange={(page) => {
                updateImmediateParams("page", page);
              }}
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
};

export default CatalogPage;
