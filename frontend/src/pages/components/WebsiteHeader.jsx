import React, { useState, useEffect } from "react";
import { Flex, Typography, Layout, Space, Menu, Dropdown, Avatar } from "antd";
import { useNavigate, Link } from "react-router-dom";
import {
  FacebookFilled,
  InstagramFilled,
  ShoppingCartOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import logo from "/vite.svg";

const { Text } = Typography;
const { Header } = Layout;

const headerStyle = {
  borderBottom: "1px solid #f0f0f0",
  height: "100px",
  display: "flex",
  flexDirection: "column",
  padding: "0px",
  margin: "0px",
  backgroundColor: "white",
};

const AccountMenu = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        const role = tokenResult.claims.role;
        console.log("Role:", role);
        setUser({ ...currentUser, role });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleMenuClick = (e) => {
    setOpen(false);
    if (e.key === "logout") {
      signOut(auth).then(() => {
        console.log("User signed out");
        navigate("/customer/login");
      });
    } else if (e.key === "account") {
      // navigate("/my-account"); // Route to the user's account page
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} style={{ minWidth: "165px" }}>
      {user ? (
        <>
          <Menu.Item key="account" style={{ fontWeight: "bold" }}>
            {user.role === "customer" ? (
              <Link to="/customer">My Account</Link>
            ) : (
              "My Account"
            )}
          </Menu.Item>

          {user.role === "admin" ? (
            <Menu.Item
              key="dashboard"
              style={{ fontWeight: "bold" }}
              onClick={() => navigate("/admin/dashboard")}
            >
              Dashboard
            </Menu.Item>
          ) : (
            <>
              <Menu.Item key="wishlist" style={{ fontWeight: "bold" }}>
                My Wish List (0)
              </Menu.Item>
              <Menu.Item key="compare" style={{ fontWeight: "bold" }}>
                Compare (0)
              </Menu.Item>
            </>
          )}

          <Menu.Divider />
          <Menu.Item key="logout" style={{ fontWeight: "bold", color: "red" }}>
            Logout
          </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item
            key="signup"
            style={{ fontWeight: "bold" }}
            onClick={() => navigate("/register")}
          >
            Create an Account
          </Menu.Item>
          <Menu.Item
            key="signin"
            style={{ fontWeight: "bold" }}
            onClick={() => navigate("/customer/login")}
          >
            Sign In
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomCenter"
      overlayStyle={{ paddingRight: "145px" }}
    >
      <Avatar
        icon={<UserOutlined />}
        style={{ cursor: "pointer" }}
        src={user?.photoURL || null}
      />
    </Dropdown>
  );
};

const WebsiteHeader = () => {
  return (
    <Header style={headerStyle}>
      {/* Top Bar */}
      <Flex
        style={{ backgroundColor: "black", height: "35px" }}
        justify="space-between"
        align="center"
        className="responsive-padding"
      >
        <div>
          <Text strong style={{ color: "grey" }}>
            Mon-Thu:{" "}
          </Text>
          <Text strong style={{ color: "white" }}>
            9:00 AM - 5:30 PM
          </Text>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "5px" }}>
          <Text strong style={{ color: "grey" }}>
            Visit our showroom in 1234 Street Address City Address, 1234
          </Text>
          <Typography.Link strong underline style={{ color: "white" }}>
            Contact Us
          </Typography.Link>
        </div>

        <Space>
          <Text strong style={{ color: "white" }}>
            Call Us: (00) 1234 5678
          </Text>
          <FacebookFilled style={{ color: "white" }} />
          <InstagramFilled style={{ color: "white" }} />
        </Space>
      </Flex>

      {/* Bottom Bar */}
      <Flex
        style={{ backgroundColor: "white", height: "60px" }}
        align="center"
        justify="space-between"
        className="responsive-padding"
      >
        <Flex align="center" gap="large">
          <Link to="/">
            <img
              src={logo}
              alt="Shop Logo"
              className="shop-logo"
              align="center"
              style={{ cursor: "pointer" }}
            />
          </Link>

          <Flex align="center" gap="middle">
            <Typography.Link strong style={{ color: "black" }}>
              Gaming Laptops
            </Typography.Link>
            <Typography.Link strong style={{ color: "black" }}>
              Business Laptops
            </Typography.Link>
            <Typography.Link strong style={{ color: "black" }}>
              Workstations
            </Typography.Link>
            <Typography.Link strong style={{ color: "black" }}>
              Ultrabooks
            </Typography.Link>
            <Typography.Link strong style={{ color: "black" }}>
              Accessories
            </Typography.Link>
            <Typography.Link
              strong
              style={{
                color: "rgba(1, 86, 255, 1)",
                border: "2px solid rgba(1, 86, 255, 1)",
                padding: "5px 18px",
                borderRadius: "20px",
              }}
              onMouseEnter={(e) => {
                (e.target.style.backgroundColor = "rgba(1, 86, 255, 1)"),
                  (e.target.style.color = "white");
              }}
              onMouseLeave={(e) => {
                (e.target.style.backgroundColor = "white"),
                  (e.target.style.color = "rgba(1, 86, 255, 1)");
              }}
            >
              Our Deals
            </Typography.Link>
          </Flex>
        </Flex>

        <Flex align="center" gap="35px">
          <Flex align="center" gap="middle">
            <SearchOutlined style={{ fontSize: "18px", color: "black" }} />
            <Link to="/shopping-cart">
              <ShoppingCartOutlined
                style={{ fontSize: "21px", color: "black" }}
              />
            </Link>
          </Flex>

          {/* Account Menu */}
          <AccountMenu />
        </Flex>
      </Flex>
    </Header>
  );
};

export default WebsiteHeader;
