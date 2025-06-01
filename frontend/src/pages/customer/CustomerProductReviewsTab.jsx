import { useEffect, useState } from "react";
import { Rate, Select, List, Spin, Typography, Tag } from "antd";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;

const CustomerProductReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0); // 0 = all ratings
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRating !== 0) {
        params.append("rating", selectedRating);
      } else {
        [1, 2, 3, 4, 5].forEach((r) => params.append("rating", r));
      }
      params.append("limit", limit);

      const response = await axios.get(`http://localhost:8000/reviews/?${params.toString()}`);
      setReviews(response.data.results);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, limit]);

  return (
    <div>
      <Title level={3}>Product Reviews</Title>

      <div style={{ marginBottom: "16px", display: "flex", gap: "16px" }}>
        <div>
          <Text>Filter by Rating:</Text>
          <Select
            style={{ width: 150 }}
            value={selectedRating}
            onChange={(value) => setSelectedRating(value)}
          >
            <Option value={0}>All Ratings</Option>
            {[5, 4, 3, 2, 1].map((r) => (
              <Option key={r} value={r}>
                {r} Stars
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <Text>Number of Reviews:</Text>
          <Select value={limit} onChange={(value) => setLimit(value)} style={{ width: 120 }}>
            {[5, 10, 20, 50].map((l) => (
              <Option key={l} value={l}>
                {l}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <Spin tip="Loading reviews..." />
      ) : (
        <List
          bordered
          dataSource={reviews}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{item.user_name || "Anonymous"}</Text>
                  <Tag color="blue">{item.created_at?.split("T")[0]}</Tag>
                </div>
                <Rate disabled defaultValue={item.rating} />
                <p style={{ marginTop: 4 }}>{item.review_text || <i>No review text provided.</i>}</p>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CustomerProductReviewsTab;
