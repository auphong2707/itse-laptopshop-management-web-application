import React, { useEffect } from "react";
import { Layout, Typography, Image } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";

import { useUser } from "../utils/UserContext";
import WebsiteHeader from "../components/WebsiteHeader";
import ImageGallery from "../components/homepage/ImageGallery";
import ProductSlider from "../components/homepage/ProductSlider";
import TabProductSlider from "../components/homepage/TabProductSlider";
import PostCardGridLayout from "../components/homepage/PostCardGridLayout";
import TestimonialSlider from "../components/homepage/TestimonialSlider";
import WebsiteFooter from "../components/WebsiteFooter";
import { transformLaptopData } from "../utils/transformData";

const { Content } = Layout;
const { Text } = Typography;

const imageSources = [
  "/homepage-image/homepage_advertisement/homepage_advertisement_1.png",
  "/homepage-image/homepage_advertisement/homepage_advertisement_2.png",
  "/homepage-image/homepage_advertisement/homepage_advertisement_3.png",
  "/homepage-image/homepage_advertisement/homepage_advertisement_4.png",
  "/homepage-image/homepage_advertisement/homepage_advertisement_5.png",
];

const brandsImg = [
  { name: "asus", logo: "/brand-logo/asus-logo.png" },
  { name: "lenovo", logo: "/brand-logo/lenovo-logo.png" },
  { name: "acer", logo: "/brand-logo/acer-logo.png" },
  { name: "dell", logo: "/brand-logo/dell-logo.png" },
  { name: "hp", logo: "/brand-logo/hp-logo.png" },
  { name: "msi", logo: "/brand-logo/msi-logo.png" },
];

const BrandLogoGallery = () => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {brandsImg.map((brand) => (
        <div
          key={brand.name}
          style={{
            width: "12%",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link to={`/laptops/${brand.name}`}>
            <Image
              src={brand.logo}
              preview={false}
              style={{
                filter: "grayscale(100%)",
                cursor: "pointer",
                transition: "transform 0.3s ease, filter 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.filter = "grayscale(0%)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.filter = "grayscale(100%)";
              }}
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

const contentStyle = {
  color: "#fff",
  backgroundColor: "white",
};

const transformTestimonialData = (data) => {
  return data.map((item) => {
    return {
      testimonial: item.review_text,
      author: item.user_name,
    };
  });
};

const transformPostData = (data) => {
  return data.map((item) => {
    return {
      img: `http://localhost:8000${item.image_url}`,
      title: item.description,
      date: item.created_at.split("T")[0].replace(/-/g, "."),
      link: item.link,
    };
  });
};

const HomePage = () => {
  const [newProductData, setNewProductData] = React.useState([]);
  const user = useUser();
  const isAdmin = user?.role === "admin";

  const brands = {
    asus: ["rog", "tuf", "zenbook", "vivobook"],
    lenovo: ["legion", "loq", "thinkpad", "thinkbook", "yoga", "ideapad"],
    acer: ["predator", "nitro", "swift", "aspire"],
    dell: ["alienware", "g series", "xps", "inspiron", "latitude", "precision"],
    hp: ["omen", "victus", "spectre", "envy", "pavilion", "elitebook"],
    msi: ["stealth", "katana", "creator", "modern"],
  };

  const [brandProductData, setBrandProductData] = React.useState({
    asus: {
      rog: [],
      tuf: [],
      zenbook: [],
      vivobook: [],
    },
    lenovo: {
      legion: [],
      loq: [],
      thinkpad: [],
      thinkbook: [],
      yoga: [],
      ideapad: [],
    },
    acer: {
      predator: [],
      nitro: [],
      swift: [],
      aspire: [],
    },
    dell: {
      alienware: [],
      "g series": [],
      xps: [],
      inspiron: [],
      latitude: [],
      precision: [],
    },
    hp: {
      omen: [],
      victus: [],
      spectre: [],
      envy: [],
      pavilion: [],
      elitebook: [],
    },
    msi: {
      stealth: [],
      katana: [],
      creator: [],
      modern: [],
    },
  });

  const [testimonialData, setTestimonialData] = React.useState([]);

  const [postData, setPostData] = React.useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch general latest laptops (limit 20)
        const newProductRequest = axios
          .get("http://localhost:8000/laptops/latest?limit=20")
          .then((response) => transformLaptopData(response.data["results"]));

        // Fetch brand-specific laptops
        const brandRequests = Object.entries(brands).flatMap(
          ([brand, subBrands]) =>
            subBrands.map((subBrand) =>
              axios
                .get(
                  `http://localhost:8000/laptops/latest?brand=${brand}&subbrand=${subBrand}`,
                )
                .then((response) => ({
                  brand,
                  subBrand,
                  data: transformLaptopData(response.data["results"]),
                })),
            ),
        );

        // Fetch testimonials
        const testimonialRequest = axios
          .get("http://localhost:8000/reviews?rating=5")
          .then((response) =>
            transformTestimonialData(response.data["results"]),
          );

        const postRequest = axios
          .get("http://localhost:8000/posts?limit=18")
          .then((response) => transformPostData(response.data["results"]));

        // Await all requests together
        const [newProductData, testimonialData, postData, ...brandResults] =
          await Promise.all([
            newProductRequest,
            testimonialRequest,
            postRequest,
            ...brandRequests,
          ]);

        // Update state in a single render pass
        setNewProductData(newProductData);
        setBrandProductData((prevState) => {
          const newData = { ...prevState };
          brandResults.forEach(({ brand, subBrand, data }) => {
            newData[brand] = {
              ...newData[brand],
              [subBrand]: data,
            };
          });
          return newData;
        });

        setPostData(postData);
        console.log("Post data:", postData);

        setTestimonialData(testimonialData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <WebsiteHeader />

      {/* Main Content */}
      <Content className="responsive-padding" style={contentStyle}>
        {/* Advertisement Title */}
        <ImageGallery imageSources={imageSources} />

        <br></br>
        <br></br>

        {/* New Products List */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignContent: "baseline",
            }}
          >
            <Text strong style={{ fontSize: 25, color: "#333" }}>
              New Products
            </Text>

            <Typography.Link href={"/laptops/all"} underline>
              See All New Products
            </Typography.Link>
          </div>
          <ProductSlider productData={newProductData} isAdmin={isAdmin} />
        </div>

        <br></br>

        {/* Banner */}
        <Image
          src="/homepage-image/homepage_second_banner.png"
          width={"100%"}
          style={{ width: "100%", height: "40px" }}
          preview={false}
        />

        <br></br>
        <br></br>
        <br></br>

        {/* ASUS sub-brands */}
        <TabProductSlider
          tabLabels={["ASUS ROG", "ASUS TUF", "ASUS Zenbook", "ASUS Vivobook"]}
          tabBanners={[
            "/tab-banners/asus/asus_rog_banner.png",
            "/tab-banners/asus/asus_tuf_banner.png",
            "/tab-banners/asus/asus_zenbook_banner.png",
            "/tab-banners/asus/asus_vivobook_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["asus"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* Lenovo sub-brands */}
        <TabProductSlider
          tabLabels={[
            "Lenovo Legion",
            "Lenovo LoQ",
            "Lenovo ThinkPad",
            "Lenovo ThinkBook",
            "Lenovo Yoga",
            "Lenovo ideaPad",
          ]}
          tabBanners={[
            "/tab-banners/lenovo/lenovo_legion_banner.png",
            "/tab-banners/lenovo/lenovo_loq_banner.png",
            "/tab-banners/lenovo/lenovo_thinkpad_banner.png",
            "/tab-banners/lenovo/lenovo_thinkbook_banner.png",
            "/tab-banners/lenovo/lenovo_yoga_banner.png",
            "/tab-banners/lenovo/lenovo_ideapad_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["lenovo"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* Acer sub-brands */}
        <TabProductSlider
          tabLabels={[
            "Acer Predator",
            "Acer Nitro",
            "Acer Swift",
            "Acer Aspire",
          ]}
          tabBanners={[
            "/tab-banners/acer/acer_predator_banner.png",
            "/tab-banners/acer/acer_nitro_banner.png",
            "/tab-banners/acer/acer_swift_banner.png",
            "/tab-banners/acer/acer_aspire_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["acer"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* Dell sub-brands */}
        <TabProductSlider
          tabLabels={[
            "Dell Alienware",
            "Dell G Series",
            "Dell XPS",
            "Dell Inspiron",
            "Dell Latitude",
            "Dell Precision",
          ]}
          tabBanners={[
            "/tab-banners/dell/dell_alienware_banner.png",
            "/tab-banners/dell/dell_g_series_banner.png",
            "/tab-banners/dell/dell_xps_banner.png",
            "/tab-banners/dell/dell_inspiron_banner.png",
            "/tab-banners/dell/dell_latitude_banner.png",
            "/tab-banners/dell/dell_precision_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["dell"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* HP sub-brands */}
        <TabProductSlider
          tabLabels={[
            "HP OMEN",
            "HP Victus",
            "HP Spectre",
            "HP ENVY",
            "HP Pavilion",
            "HP EliteBook",
          ]}
          tabBanners={[
            "/tab-banners/HP/hp_omen_banner.png",
            "/tab-banners/HP/hp_victus_banner.png",
            "/tab-banners/HP/hp_spectre_banner.png",
            "/tab-banners/HP/hp_envy_banner.png",
            "/tab-banners/HP/hp_pavilion_banner.png",
            "/tab-banners/HP/hp_elitebook_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["hp"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* MSI sub-brands */}
        <TabProductSlider
          tabLabels={["MSI Stealth", "MSI Katana", "MSI Creator", "MSI Modern"]}
          tabBanners={[
            "/tab-banners/msi/msi_stealth_banner.png",
            "/tab-banners/msi/msi_katana_banner.png",
            "/tab-banners/msi/msi_creator_banner.png",
            "/tab-banners/msi/msi_modern_banner.png",
          ]}
          tabProductData={Object.values(brandProductData["msi"])}
          isAdmin={isAdmin}
        />

        <br></br>
        <br></br>

        {/* Brand logo gallery */}
        <BrandLogoGallery />

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
          <TestimonialSlider testimonialData={testimonialData} />
        </div>
      </Content>

      {/* Footer */}
      <WebsiteFooter />
    </Layout>
  );
};

export default HomePage;
