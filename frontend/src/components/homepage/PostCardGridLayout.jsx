import { Row, Col } from "antd";
import PropTypes from "prop-types";

import PostCard from "./PostCard";

const PostCardGridLayout = ({ postData }) => {
  return (
    <Row gutter={[16, 16]}>
      {postData.map((data, index) => (
        <Col xs={24} sm={12} md={8} lg={4} key={index}>
          <PostCard {...data} />
        </Col>
      ))}
    </Row>
  );
};
PostCardGridLayout.propTypes = {
  postData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default PostCardGridLayout;
