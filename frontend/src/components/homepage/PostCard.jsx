import { Card, Typography } from "antd";
import PropTypes from "prop-types";

const { Paragraph, Text } = Typography;

const PostCard = ({ img, title, date }) => (
  <Card
    hoverable
    cover={<img src={img} style={{ height: 200, objectFit: "contain" }} />}
    style={{
      height: 345,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Paragraph
        ellipsis={{ rows: 6, expandable: false }}
        style={{ cursor: "pointer", fontSize: 13, textAlign: "center" }}
      >
        {title}
      </Paragraph>

      <div style={{ flexGrow: 1 }}></div>

      <Text type="secondary" style={{ textAlign: "center" }}>
        {date}
      </Text>
    </div>
  </Card>
);
PostCard.propTypes = {
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

export default PostCard;
