import { Layout, Breadcrumb, Typography, Select, Input, Pagination } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import WebsiteHeader from "../components/WebsiteHeader";
import WebsiteFooter from "../components/WebsiteFooter";
import ProductCard from "../components/ProductCard";
import { transformLaptopData } from "../utils/transformData";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const contentStyle = {
  color: "#fff",
  backgroundColor: "white",
  minHeight: "100vh",
};

const CustomSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 0 !important;
    border-width: 3px !important;
  }
`;

/**
 * Build query string for the search API.
 * If sortKey === "relevant" omit &sort to let ES default.
 */
const buildQueryString = (query, limit, page, sortKey) => {
  let qs = `?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
  if (sortKey && sortKey !== "relevant") qs += `&sort=${sortKey}`;
  return qs;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* URL-driven parameters */
  const keyword = searchParams.get("query") || "";
  const limit = parseInt(searchParams.get("limit")) || 35;
  const page = parseInt(searchParams.get("page")) || 1;
  const sortKey = searchParams.get("sort") || "relevant";

  const updateParams = (params) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([k, v]) => next.set(k, v));
    setSearchParams(next);
  };

  /* Data state */
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setProducts([]);
      setTotalProducts(0);
      return;
    }

    const qs = buildQueryString(keyword, limit, page, sortKey);
    setLoading(true);
    axios
      .get(`http://localhost:8000/laptops/search${qs}`)
      .then((res) => {
        setTotalProducts(res.data.total_count || 0);
        return res.data.results || [];
      })
      .then((data) => transformLaptopData(data))
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [keyword, limit, page, sortKey]);

  /* Search handler */
  const handleSearch = (value) => {
    const term = value.trim();
    if (!term) return;
    navigate(
      `/search?query=${encodeURIComponent(term)}&limit=${limit}&page=1&sort=${sortKey}`,
    );
  };

  /* Range text */
  const from = totalProducts === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalProducts);

  return (
    <Layout>
      <WebsiteHeader
        extraSearch={
          <Input.Search
            size="large"
            allowClear
            placeholder="Search laptops…"
            defaultValue={keyword}
            onSearch={handleSearch}
          />
        }
      />
      <Content className="responsive-padding" style={contentStyle}>
        <br />
        <Breadcrumb separator=">" style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Search</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={1} style={{ marginBottom: 24 }}>
          Results for “{keyword}” ({totalProducts} item{totalProducts === 1 ? "" : "s"})
        </Title>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text type="secondary">
            Showing {from}-{to} of {totalProducts}
          </Text>

          <div style={{ display: "flex", gap: 12 }}>
            <CustomSelect
              style={{ width: 260, height: 50 }}
              value={sortKey}
              onChange={(v) => updateParams({ sort: v, page: 1 })}
            >
              <Option value="relevant">
                <Text type="secondary" strong>
                  Sort by: {" "}
                </Text>
                <Text strong>Most relevant</Text>
              </Option>
              <Option value="latest">
                <Text type="secondary" strong>
                  Sort by: {" "}
                </Text>
                <Text strong>Latest arrivals</Text>
              </Option>
              <Option value="price_asc">
                <Text type="secondary" strong>
                  Sort by: {" "}
                </Text>
                <Text strong>Price (Low → High)</Text>
              </Option>
              <Option value="price_desc">
                <Text type="secondary" strong>
                  Sort by: {" "}
                </Text>
                <Text strong>Price (High → Low)</Text>
              </Option>
            </CustomSelect>

            <CustomSelect
              style={{ width: 180, height: 50 }}
              value={limit}
              onChange={(v) => updateParams({ limit: v, page: 1 })}
            >
              {[15, 35, 50].map((n) => (
                <Option key={n} value={n}>
                  <Text type="secondary" strong>
                    Show:
                  </Text>{" "}
                  <Text strong>{n} per page</Text>
                </Option>
              ))}
            </CustomSelect>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <Text>Loading…</Text>
        ) : (
          <div className="grid-division">
            {products.map((p, i) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        )}

        <br />

        {totalProducts > limit && (
          <Pagination
            align="center"
            current={page}
            total={totalProducts}
            pageSize={limit}
            showSizeChanger={false}
            onChange={(p) => updateParams({ page: p })}
          />
        )}
      </Content>
      <WebsiteFooter />
    </Layout>
  );
};

export default SearchPage;