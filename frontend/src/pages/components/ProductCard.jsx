import React from "react";
import { Card, Typography, Rate, Tooltip, Image } from "antd";
import { CheckCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price) => {
	return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const ProductCard = ({ inStock, imgSource, rate, numRate, productName, originalPrice, salePrice }) => {
  return (
		<div style={{ padding: 3 }}>
			<Card
				style={{
					width: 228,
					height: 345,
					borderRadius: 2,
				}}
				hoverable
				variant="borderless"
			>
				{/* Availability Check */}
				{inStock ? (
					<div style={{ align: "center", marginBottom: 10, color: "#78A962" }}>
						<CheckCircleFilled style={{ fontSize: 12 }}/>
						<Text strong style={{ marginLeft: 7, color: "#78A962", fontSize: 12 }}>
							in stock
						</Text>
					</div>
				) : (
					<div style={{ alignC: "center", marginBottom: 10, color: "#C94D3F" }}>
						<InfoCircleFilled style={{ fontSize: 12 }}/>
						<Text strong style={{ marginLeft: 7, color: "#C94D3F", fontSize: 12 }}>
							check availability
						</Text>
					</div>
				)}
				
				{/* Product Image */}
				<Image src={imgSource} height={120} width="100%" preview={false}/>

				{/* Star Rating & Reviews */}
				<div style={{ marginTop: 2, width: "100%" }}>
					<Rate disabled value={rate} style={{ fontSize: 10 }} allowHalf />
					<Text style={{ marginLeft: 10, color: "#666", fontSize: 10 }} strong={false}>({numRate} Reviews)</Text>
				</div>

				{/* Product Name */}
				<div style={{ marginTop: 5 }}>
					<Tooltip title={productName} placement="top">
						<Paragraph
							ellipsis={{ rows: 2, expandable: false }}
							style={{ cursor: "pointer", fontSize: 13 }}
							strong={false}
						>
							{productName}
						</Paragraph>
					</Tooltip>
				</div>

				{/* Price Section */}
				<div>
					<Text delete style={{ fontSize: 13, color: "#888" }} strong={false}>
						{formatPrice(originalPrice)}đ
					</Text>
					<Title level={4} style={{ margin: 0, color: "#000" }}>
						{formatPrice(salePrice)}đ
					</Title>
				</div>
			</Card>
		</div>
  );
};

ProductCard.propTypes = {
  inStock: PropTypes.bool,
  imgSource: PropTypes.string,
  rate: PropTypes.number,
  numRate: PropTypes.number,
  productName: PropTypes.string,
  originalPrice: PropTypes.number,
  salePrice: PropTypes.number,
};

const getRandomProductCardData = () => {
	const originalPrice = Math.random() * 1000;
	const salePrice = originalPrice - Math.random() * 100;

  return {
		inStock: Math.random() > 0.5,
		imgSource: null,
		rate: Math.random() * 5,
		numRate: Math.floor(Math.random() * 100),
		productName: `PRODUCT ${Math.floor(Math.random() * 100)}` + " ("+ "LENGTH TEST ".repeat(5) + ")",
		originalPrice: originalPrice,
		salePrice: salePrice
	}
};


export default ProductCard;

export { getRandomProductCardData };
