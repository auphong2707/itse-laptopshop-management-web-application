import React, { useEffect } from 'react';
import { Layout, Typography, Image, Divider } from "antd";
import WebsiteHeader from "./components/WebsiteHeader";
import ImageGallery from "./components/ImageGallery";
import ProductSlider from './components/ProductSlider';
import TabProductSlider from './components/TabProductSlider';
import PostCardGridLayout from './components/PostCardGridLayout';
import TestimonialSlider from './components/TestimonialSlider';
import WebsiteFooter from './components/WebsiteFooter';
import { transformLaptopData } from '../utils.js';

import axios from 'axios';

const { Content } = Layout;
const { Text, Link } = Typography;

const imageSources = [
  "/homepage_advertisement_1.png",
  "/homepage_advertisement_1.png",
  "/homepage_advertisement_1.png",
  "/homepage_advertisement_1.png",
  "/homepage_advertisement_1.png"
]

const contentStyle = {
  color: '#fff',
  backgroundColor: 'white',
};


const transformTestimonialData = (data) => {
  return data.map(item => {
    return {
      testimonial: item.review_text,
      author: item.user_name
    }
  });
};

const transformPostData = (data) => {
  return data.map(item => {
    return {
      img: item.image_url,
      title: item.description,
      date: item.created_at.split('T')[0].replace(/-/g, '.'),
      link: item.link
    }
  });
};

const HomePage = () => {
  const [newProductData, setNewProductData] = React.useState([]);

  const brands = {
    asus: ['rog', 'tuf', 'zenbook', 'vivobook'],
    lenovo: ['legion', 'loq', 'thinkpad', 'thinkbook', 'yoga','ideapad'],
    acer: ['predator', 'nitro', 'swift', 'aspire'],
    dell: ['alienware', 'g series', 'xps', 'inspiron', 'latitude', 'precision'],
    hp: ['omen', 'victus', 'spectre', 'envy', 'pavilion', 'elitebook'],
    msi: ['stealth', 'katana', 'creator', 'modern']
  };

  const [brandProductData, setBrandProductData] = React.useState({
      "asus": { 
        "rog": [], "tuf": [], "zenbook": [], "vivobook": []
      },
      "lenovo": { 
        "legion": [], "loq": [], "thinkpad": [], "thinkbook": [], "yoga": [], "ideapad": [] 
      },
      "acer": { 
        "predator": [], "nitro": [], "swift": [], "aspire": [] 
      },
      "dell": { 
        "alienware": [], "g series": [], "xps": [], "inspiron": [], "latitude": [], "precision": [] 
      },
      "hp": { 
        "omen": [], "victus": [], "spectre": [], "envy": [], "pavilion": [], "elitebook": []
      },
      "msi": { 
        "stealth": [], "katana": [], "creator": [], "modern": []
      }
  });

  const [testimonialData, setTestimonialData] = React.useState([])

  const [postData, setPostData] = React.useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch general latest laptops (limit 20)
        const newProductRequest = axios.get(
          'http://localhost:8000/laptops/latest?limit=20'
        ).then(response => transformLaptopData(response.data['results']));
  
        // Fetch brand-specific laptops
        const brandRequests = Object.entries(brands).flatMap(([brand, subBrands]) =>
          subBrands.map(subBrand =>
            axios.get(`http://localhost:8000/laptops/latest?brand=${brand}&subbrand=${subBrand}`)
              .then(response => ({ brand, subBrand, data: transformLaptopData(response.data['results']) }))
          )
        );

        // Fetch testimonials
        const testimonialRequest = axios.get(
          'http://localhost:8000/reviews?rating=5'
        ).then(response => transformTestimonialData(response.data['results']));

        const postRequest = axios.get(
          'http://localhost:8000/posts?limit=18'
        ).then(response => transformPostData(response.data['results']));
  
        // Await all requests together
        const [newProductData, testimonialData, postData, ...brandResults] = await Promise.all([
          newProductRequest,
          testimonialRequest,
          postRequest,
          ...brandRequests
        ]);
  
        // Update state in a single render pass
        setNewProductData(newProductData);
        setBrandProductData(prevState => {
          const newData = { ...prevState };
          brandResults.forEach(({ brand, subBrand, data }) => {
            newData[brand] = {
              ...newData[brand],
              [subBrand]: data
            };
          });
          return newData;
        });
        
        setPostData(postData);

        setTestimonialData(testimonialData);
  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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

            <Link href={"/laptops/all"} underline>
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
          tabLabels={["ASUS ROG", "ASUS TUF", "ASUS ZENBOOK", "ASUS VIVOBOOK"]}
          tabBanners={["None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["asus"])}
        />

        <br></br>
        <br></br>

        {/* Lenovo sub-brands */}
        <TabProductSlider
          tabLabels={["LENOVO LEGION", "LENOVO LOQ", "LENOVO THINKPAD", "LENOVO THINKBOOK", "LENOVO YOGA", "LENOVO IDEAPAD"]}
          tabBanners={["None", "None", "None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["lenovo"])}
        />

        <br></br>
        <br></br>

        {/* Acer sub-brands */}
        <TabProductSlider
          tabLabels={["ACER PREDATOR", "ACER NITRO", "ACER SWIFT", "ACER ASPIRE"]}
          tabBanners={["None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["acer"])}
        />
        
        <br></br>
        <br></br>

        {/* Dell sub-brands */}
        <TabProductSlider
          tabLabels={["DELL ALIENWARE", "DELL G SERIES", "DELL XPS", "DELL INSPIRON", "DELL LATITUDE", "DELL PRECISION"]}
          tabBanners={["None", "None", "None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["dell"])}
        />

        <br></br>
        <br></br>

        {/* HP sub-brands */}
        <TabProductSlider
          tabLabels={["HP OMEN", "HP VICTUS", "HP SPECTRE", "HP ENVY", "HP PAVILION", "HP ELITEBOOK"]}
          tabBanners={["None", "None", "None", "None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["hp"])}
        />

        <br></br>
        <br></br>

        {/* MSI sub-brands */}
        <TabProductSlider
          tabLabels={["MSI STEALTH", "MSI KATANA", "MSI CREATOR", "MSI MODERN"]}
          tabBanners={["None", "None", "None", "None"]}
          tabProductData={Object.values(brandProductData["msi"])}
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

        {/* Post tab */}
        <div>
          <Text strong style={{ fontSize: 25, color: "#333" }}>
            Follow us on Instagram for News, Offers & More
          </Text>
        </div>

        <br></br>

        <PostCardGridLayout postData={postData} />

        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <div style={{ width: "85%", margin: "auto" }}>
          <TestimonialSlider testimonialData={testimonialData}/>
        </div>

      </Content>

      {/* Footer */}
      <WebsiteFooter />

    </Layout>
  );
}

export default HomePage;