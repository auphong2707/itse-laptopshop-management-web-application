import { Row, Col } from "antd";
import NewsCard from "./NewsCard";

const NewsCardGridLayout = ({newsData}) => {
	return (
		<Row gutter={[16, 16]}>
			{newsData.map((data, index) => (
				<Col xs={24} sm={12} md={8} lg={4} key={index}>
					<NewsCard {...data} />
				</Col>
			))}
		</Row>
	);
};

export default NewsCardGridLayout;
