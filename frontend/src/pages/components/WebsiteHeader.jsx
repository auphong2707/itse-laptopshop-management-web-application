import React from 'react';
import { Flex, Typography, Layout, Space } from "antd";
import { FacebookFilled, InstagramFilled, ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar } from "antd";
import logo from '/vite.svg'


const { Text, Link } = Typography;
const {Header, Content, Footer} = Layout;

const headerStyle = {
  borderBottom: "1px solid #f0f0f0",
  height: "100px",
  display: "flex",
  flexDirection: "column",
  padding: "0px",
  margin: "0px",
  backgroundColor: "white"
};

const WebsiteHeader = () => {
	return (
		<Header style={headerStyle}>
			{/* Top Bar */}
			<Flex style={{ backgroundColor:"black", height:"35px"}} justify='space-between' align='center' className='responsive-padding'>
				<div>
					<Text strong style={{color:"grey"}}>Mon-Thu: </Text>
					<Text strong style={{color:"white"}}>9:00 AM - 5:30 PM</Text>
				</div>

				<div style={{display:"flex", flexDirection:"row", gap:"5px"}}>
					<Text strong style={{color:"grey"}}>Visit our showroom in 1234 Street Adress City Address, 1234</Text>
					<Link strong underline style={{color:"white"}}>Contact Us</Link>
				</div>

				<Space>
					<Text strong style={{color:"white"}}>Call Us: (00) 1234 5678</Text>
					<FacebookFilled style={{color:"white"}}/>
					<InstagramFilled style={{color:"white"}}/>
				</Space>
			</Flex>
				
			{/* Bottom Bar */}
			<Flex style={{ backgroundColor:"white", height:"60px"}} align='center' justify='space-between' className='responsive-padding'>
				<Flex align='center' gap="large">
					<img src={logo} alt='Shop Logo' className='shop-logo' align='center'></img>
					
					<Flex align='center' gap="middle">
						<Link strong style={{color:"black"}}>Gaming Laptops</Link>
						<Link strong style={{color:"black"}}>Business Laptops</Link>
						<Link strong style={{color:"black"}}>Workstations</Link>
						<Link strong style={{color:"black"}}>Ultrabooks</Link>
						<Link strong style={{color:"black"}}>Accessories</Link>
						<Link 
							strong 
							style={{
									color:"rgba(1, 86, 255, 1)",
									border:"2px solid rgba(1, 86, 255, 1)",
									padding:"5px 18px",
									borderRadius:"20px",
							}}
							onMouseEnter={(e) => {e.target.style.backgroundColor = "rgba(1, 86, 255, 1)", e.target.style.color = "white"}}
							onMouseLeave={(e) => {e.target.style.backgroundColor = "white", e.target.style.color = "rgba(1, 86, 255, 1)"}}
						>
							Our Deals
						</Link>
					</Flex>
				</Flex>
				
				<Flex align='center' gap="35px">
					<Flex align='center' gap="middle">
						<SearchOutlined style={{fontSize:"18px", color:"black"}}/>
						<ShoppingCartOutlined style={{fontSize:"21px", color:"black"}}/>
					</Flex>

					<Avatar shape='circle'>User</Avatar>
				</Flex>
			</Flex>
		</Header>
	);
}

export default WebsiteHeader;