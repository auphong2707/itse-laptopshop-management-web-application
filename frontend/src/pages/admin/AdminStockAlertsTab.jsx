import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import StockAlertTable from "../../components/administrator_page/StockAlertTable";

const transformStockData = (data) => {
  return data.map((item) => ({
    id: item.id,
    brand: item.brand.toUpperCase(),
    image: "http://localhost:8000" + JSON.parse(item.product_image_mini)[0],
    name: item.name.toUpperCase(),
    quantity: item.quantity,
  }));
};


const AdminStockAlertsTab = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchStockData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      // Update URL and scroll to top
      navigate(`?page=${page}&limit=${pageSize}`, { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });

      const result = await axios
        .get(
          `http://localhost:8000/laptops/low-stock?page=${page}&limit=${pageSize}`,
        )
        .then((res) => res.data);

      const transformedData = transformStockData(result.results);

      setStockData(transformedData);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: result.total_count,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get("page")) || 1;
    const limit = parseInt(queryParams.get("limit")) || 20;

    fetchStockData(page, limit);
  }, [location.search]);

  return (
    <div>
      <StockAlertTable
        data={stockData}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchStockData}
      />
    </div>
  );
};

export default AdminStockAlertsTab;