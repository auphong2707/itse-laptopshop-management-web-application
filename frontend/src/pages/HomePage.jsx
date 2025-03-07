import React, { useEffect } from 'react';
import { Layout, Typography, Image, Divider } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import ImageGallery from "./components/ImageGallery";
import ProductSlider from './components/ProductSlider';
import { getRandomProductCardData } from "./components/ProductCard";
import TabProductSlider from './components/TabProductSlider';
import NewsCardGridLayout from './components/NewsCardGridLayout';
import TestimonialSlider from './components/TestimonialSlider';
import WebsiteFooter from './components/WebsiteFooter';

import axios from 'axios';

const { Content } = Layout;
const { Text, Link } = Typography;

const imageSources = [
  "None",
  "None",
  "None",
  "None",
  "None"
]

const newsData = [
  { img: "/path-to-image1.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace.", date: "01.09.2020" },
  { img: "/path-to-image2.jpg", title: "As a gamer, superior sound counts for a lot. You need to hear enemies tiptoeing up behind you or a sneak attack.", date: "01.09.2020" },
  { img: "/path-to-image3.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" },
  { img: "/path-to-image4.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" },
  { img: "/path-to-image5.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" },
  { img: "/path-to-image6.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" },
  { img: "/path-to-image7.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" },
  { img: "/path-to-image8.jpg", title: "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals.", date: "01.09.2020" }
];

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
};

const HomePage = () => {
  const [newProductData, setNewProductData] = React.useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/laptops/latest?projection=product-card&limit=20')
      .then((response) => {
        const data = response.data;
        const transformed = data.map(item => {
          return {
            productName: item.name.toUpperCase(),
            numRate: item.num_rate,
            originalPrice: item.original_price,
            imgSource: item.product_image_mini,
            inStock: item.quantity > 0,
            rate: item.rate,
            salePrice: item.sale_price
          };
        });

        setNewProductData(transformed);
      }
    );
  }
  , []);

  return (
    <Layout>
      {/* Header */}
      <WebsiteHeader />

      {/* Main Content */}
      <Content className='responsive-padding' style={contentStyle}>
        {/* Advertisement Title */}
        <ImageGallery imageSources={imageSources} />
        
        <br></br>
        <br></br>

        {/* New Products List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignContent: "baseline" }}>
            <Text strong style={{ fontSize: 25, color: "#333" }}>
              New Products
            </Text>

            <Link href={null} underline>
              See All New Products
            </Link>
          </div>
          <ProductSlider productData={newProductData} />
        </div>

        <br></br>

        {/* Banner */}
        <Image
          src="None"
          width={"100%"}
          style={{ width: "100%", height: "40px" }}
          preview={false}
        />
        
        <br></br>
        <br></br>
        <br></br>

        {/* ASUS sub-brands */}
        <TabProductSlider
          tabLabels={["ASUS ROG", "ASUS TUF", "ASUS ZENBOOK", "ASUS VIVOBOOK", "ASUS EXPERTBOOK"]}
          tabBanners={["None", "None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />

        <br></br>
        <br></br>

        {/* Lenovo sub-brands */}
        <TabProductSlider
          tabLabels={["LENOVO LEGION", "LENOVO LOQ", "LENOVO THINKPAD", "LENOVO THINKBOOK", "LENOVO YOGA", "LENOVO IDEAPAD"]}
          tabBanners={["None", "None", "None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />

        <br></br>
        <br></br>

        {/* Acer sub-brands */}
        <TabProductSlider
          tabLabels={["ACER PREDATOR", "ACER NITRO", "ACER SWIFT", "ACER ASPIRE"]}
          tabBanners={["None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />
        
        <br></br>
        <br></br>

        {/* Dell sub-brands */}
        <TabProductSlider
          tabLabels={["DELL ALIENWARE", "DELL G SERIES", "DELL XPS", "DELL INSPIRON", "DELL LATITUDE", "DELL PRECISION"]}
          tabBanners={["None", "None", "None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />

        <br></br>
        <br></br>

        {/* HP sub-brands */}
        <TabProductSlider
          tabLabels={["HP OMEN", "HP VICTUS", "HP SPECTRE", "HP ENVY", "HP PAVILION", "HP ELITEBOOK", "HP ZBOOK"]}
          tabBanners={["None", "None", "None", "None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />

        <br></br>
        <br></br>

        {/* MSI sub-brands */}
        <TabProductSlider
          tabLabels={["MSI TITAN", "MSI RAIDER", "MSI STEALTH", "MSI KATANA", "MSI PRESTIGE", "MSI CREATOR"]}
          tabBanners={["None", "None", "None", "None", "None", "None"]}
          tabProductData={[
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
            Array.from({ length: 10 }, (_, i) => getRandomProductCardData()),
          ]}
        />

        <br></br>
        <br></br>

        {/* Brand logo gallery */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/asus-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>
          
          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/lenovo-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>

          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/acer-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>
          
          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/dell-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>
          
          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/hp-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>
          
          <div style={{ width:"12%", height:"100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image src="/brand-logo/msi-logo.png" preview={false} style={{ filter: "grayscale(100%)" }} />
          </div>
        </div>

        <br></br>
        <br></br>

        {/* News tab */}
        <div>
          <Text strong style={{ fontSize: 25, color: "#333" }}>
            Follow us on Instagram for News, Offers & More
          </Text>
        </div>

        <br></br>

        <NewsCardGridLayout newsData={newsData} />

        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <div style={{ width: "85%", margin: "auto" }}>
          <TestimonialSlider />
        </div>

      </Content>

      {/* Footer */}
      <WebsiteFooter />

    </Layout>
  );
}

export default HomePage;