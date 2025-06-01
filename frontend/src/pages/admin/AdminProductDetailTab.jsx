import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import "swiper/css";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
} from "antd";
import { Divider } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const transformFormData = (values) => {
  return {
    brand: values.brand || "",
    sub_brand: values.sub_brand || "",
    name: values.name || "",
    cpu: values.cpu || "",
    vga: values.vga || "",
    ram_amount: values.ram_amount ? parseInt(values.ram_amount, 10) : 0,
    ram_type: values.ram_type || "",
    storage_amount: values.storage_amount
      ? parseInt(values.storage_amount, 10)
      : 0,
    storage_type: values.storage_type || "",
    webcam_resolution: values.webcam_resolution || "",
    screen_size: values.screen_size ? parseFloat(values.screen_size) : 0,
    screen_resolution: values.screen_resolution || "",
    screen_refresh_rate: values.screen_refresh_rate
      ? parseInt(values.screen_refresh_rate, 10)
      : 0,
    screen_brightness: values.screen_brightness
      ? parseInt(values.screen_brightness, 10)
      : 0,
    battery_capacity: values.battery_capacity
      ? parseFloat(values.battery_capacity)
      : 0,
    battery_cells: values.battery_cells
      ? parseInt(values.battery_cells, 10)
      : 0,
    weight: values.weight ? parseFloat(values.weight) : 0,
    default_os: values.default_os || "",
    warranty: values.warranty ? parseInt(values.warranty, 10) : 0,
    width: values.width ? parseFloat(values.width) : 0,
    depth: values.depth ? parseFloat(values.depth) : 0,
    height: values.height ? parseFloat(values.height) : 0,
    number_usb_a_ports: values.number_usb_a_ports
      ? parseInt(values.number_usb_a_ports, 10)
      : 0,
    number_usb_c_ports: values.number_usb_c_ports
      ? parseInt(values.number_usb_c_ports, 10)
      : 0,
    number_hdmi_ports: values.number_hdmi_ports
      ? parseInt(values.number_hdmi_ports, 10)
      : 0,
    number_ethernet_ports: values.number_ethernet_ports
      ? parseInt(values.number_ethernet_ports, 10)
      : 0,
    number_audio_jacks: values.number_audio_jacks
      ? parseInt(values.number_audio_jacks, 10)
      : 0,
    product_image_mini: values.product_image_mini || "",
    quantity: values.quantity ? parseInt(values.quantity, 10) : 0,
    original_price: values.original_price
      ? parseInt(values.original_price, 10)
      : 0,
    sale_price: values.sale_price ? parseInt(values.sale_price, 10) : 0,
  };
};

const AdminProductDetailTab = () => {
  const sectionTitleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "2rem",
  };

  const CustomDivider = ({ label }) => (
    <>
      <h3 style={sectionTitleStyle}>{label}</h3>
      <div style={{ width: "100%" }}>
        <Divider style={{ margin: "8px 0 24px 0", borderTopWidth: "2px" }} />
      </div>
    </>
  );

  CustomDivider.propTypes = {
    label: PropTypes.string.isRequired,
  };

  const [form] = Form.useForm();
  const { id } = useParams();
  const [_, setProductData] = useState({});
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8000/laptops/id/${id}`)
        .then((response) => {
          setProductData(response.data);
          form.setFieldsValue(response.data);

          // Extract and parse product images
          let images = [];
          if (response.data.product_image_mini) {
            try {
              images = JSON.parse(response.data.product_image_mini || "[]").map(
                (url) => `http://localhost:8000${url}`,
              );
              console.log("Parsed images:", images);
            } catch (error) {
              console.error("Error parsing product images:", error);
              images = [];
            }
          }
          setPictures(images);
        })
        .catch(() => {
          setProductData({});
          form.resetFields();
          setPictures([]); // Clear pictures on error
        });
    } else {
      form.resetFields();
      setPictures([]); // Clear pictures when no ID
    }
  }, [id]);

  const handleAddPicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newPicture = URL.createObjectURL(file);
      setPictures((prev) => [...prev, newPicture]);
    }
  };

  const handleDeletePicture = (indexToDelete) => {
    setPictures((prevPictures) =>
      prevPictures.filter((_, index) => index !== indexToDelete),
    );
  };

  const handleSubmit = async (form) => {
    const formData = form.getFieldsValue();

    try {
      if (id) {
        // Update existing laptop
        await axios.put(`http://localhost:8000/laptops/${id}`, formData);
        console.log("Update Success");
      } else {
        const transformedData = transformFormData(formData);
        console.log(
          "Transformed Data:",
          JSON.stringify(transformedData, null, 2),
        );
        // Insert new laptop
        await axios.post("http://localhost:8000/laptops/", transformedData);
        console.log("Insert Success");
        form.resetFields();
      }
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  return (
    <div style={{ padding: "0rem 0" }}>
      <Form
        layout="horizontal"
        form={form}
        labelCol={{ span: 4 }}
        labelAlign="left"
        colon={false}
      >
        {/* General Information */}
        <CustomDivider label="General Information" />
        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Brand</span>} name="brand"
          rules={[{ required: true, message: "Brand is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Sub Brand</span>} name="sub_brand"
          rules={[{ required: false, message: "Sub Brand is optional" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Name</span>} name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Description</span>} name="description"
          rules={[{ required: false }]}>
          <Input.TextArea rows={10} />
        </Form.Item>

        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Usage Type</span>}
          name="usage_type"
          rules={[{ required: true, message: "Usage Type is required" }]}
        >
          <Select>
            <Select.Option value="gaming">Gaming</Select.Option>
            <Select.Option value="business">Business</Select.Option>
            <Select.Option value="workstation">Workstation</Select.Option>
            <Select.Option value="ultrabook">Ultrabook</Select.Option>
            <Select.Option value="general">General</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Operating System</span>}
          rules={[{ required: true, message: "Operating System is required" }]}
          name="default_os"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Warranty</span>}
          rules={[{ required: true, message: "Warranty is required" }]}
          name="warranty"
        >
          <InputNumber />
        </Form.Item>

        {/* Performance */}
        <CustomDivider label="Performance" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>CPU</span>}
          name="cpu"
          rules={[{ required: true, message: "CPU is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>GPU</span>}
          name="vga"
          rules={[{ required: false }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>RAM Amount</span>}
          rules={[{ required: true, message: "RAM Amount is required" }]}
          name="ram_amount"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>RAM Type</span>}
          rules={[{ required: true, message: "RAM Type is required" }]}
          name="ram_type"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Storage Amount</span>}
          rules={[{ required: true, message: "Storage Amount is required" }]}
          name="storage_amount"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Storage Type</span>}
          rules={[{ required: true, message: "Storage Type is required" }]}
          name="storage_type"
        >
          <Input />
        </Form.Item>

        {/* Display */}
        <CustomDivider label="Display" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Size</span>}
          rules={[{ required: true, message: "Screen Size is required" }]}
          name="screen_size"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Resolution</span>}
          rules={[{ required: true, message: "Screen Resolution is required" }]}
          name="screen_resolution"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Refresh Rate</span>}
          rules={[{ required: true, message: "Screen Refresh Rate is required" }]}
          name="screen_refresh_rate"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Brightness</span>}
          rules={[{ required: true, message: "Screen Brightness is required" }]}
          name="screen_brightness"
        >
          <InputNumber />
        </Form.Item>

        {/* Battery and Power */}
        <CustomDivider label="Battery and Power" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Battery Capacity</span>}
          rules={[{ required: true, message: "Battery Capacity is required" }]}
          name="battery_capacity"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Battery Cells</span>}
          rules={[{ required: true, message: "Battery Cells is required" }]}
          name="battery_cells"
        >
          <Input />
        </Form.Item>

        {/* Physical Dimensions and Weight */}
        <CustomDivider label="Physical Dimensions and Weight" />
        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Width</span>} name="width"
          rules={[{ required: true, message: "Width is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Depth</span>} name="depth"
          rules={[{ required: true, message: "Depth is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Height</span>} name="height"
          rules={[{ required: true, message: "Height is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item 
          label={<span style={{fontWeight: "bold"}}>Weight</span>} name="weight"
          rules={[{ required: true, message: "Weight is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Connectivity and Ports */}
        <CustomDivider label="Connectivity and Ports" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>USB-A Ports</span>}
          rules={[{ required: true, message: "USB-A Ports is required" }]}
          name="number_usb_a_ports"
        >
          <InputNumber
            min={0}
            defaultValue={0}
            controls={true}
            style={{
              width: "60px",
              fontWeight: "bold",
              borderRadius: "4px",
              backgroundColor: "#d9d9d9",
              padding: "4px",
              textAlign: "center",
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>USB-C Ports</span>}
          name="number_usb_c_ports"
          rules= {[{ required: true, message: "USB-C Ports is required" }]}
        >
          <InputNumber
            min={0}
            defaultValue={0}
            controls={true}
            style={{
              width: "60px",
              fontWeight: "bold",
              borderRadius: "4px",
              backgroundColor: "#d9d9d9",
              padding: "4px",
              textAlign: "center",
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{fontWeight: "bold"}}>HDMI Ports</span>}
          name="number_hdmi_ports"
          rules={[{ required: true, message: "HDMI Ports is required" }]}
        >
          <InputNumber
            min={0}
            defaultValue={0}
            controls={true}
            style={{
              width: "60px",
              fontWeight: "bold",
              borderRadius: "4px",
              backgroundColor: "#d9d9d9",
              padding: "4px",
              textAlign: "center",
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Ethernet Ports</span>}
          name="number_ethernet_ports"
          rules={[{ required: true, message: "Ethernet Ports is required" }]}
        >
          <InputNumber
            min={0}
            defaultValue={0}
            controls={true}
            style={{
              width: "60px",
              fontWeight: "bold",
              borderRadius: "4px",
              backgroundColor: "#d9d9d9",
              padding: "4px",
              textAlign: "center",
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Audio Jacks</span>}
          name="number_audio_jacks"
          rules={[{ required: true, message: "Audio Jacks is required" }]}
        >
          <InputNumber
            min={0}
            defaultValue={0}
            controls={true}
            style={{
              width: "60px",
              fontWeight: "bold",
              borderRadius: "4px",
              backgroundColor: "#d9d9d9",
              padding: "4px",
              textAlign: "center",
            }}
          />
        </Form.Item>

        {/* Other features */}
        <CustomDivider label="Other features" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Webcam Resolution</span>}
          rules={[{ required: false, message: "Webcam Resolution is optional" }]}
          name="webcam_resolution"
        >
          <Input />
        </Form.Item>

        {/* Price */}
        <CustomDivider label="Retail information" />
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Quantity</span>}
          rules={[{ required: true, message: "Quantity is required" }]}
          name="quantity"
        >
          <InputNumber defaultValue={0} />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Original Price</span>}
          rules={[{ required: true, message: "Original Price is required" }]}
          name="original_price"
        >
          <InputNumber suffix="đ" />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Sale Price</span>}
          rules={[{ required: true, message: "Sale Price is required" }]}
          name="sale_price"
        >
          <InputNumber suffix="đ" />
        </Form.Item>

        {/* Images */}
        <CustomDivider label="Images" />
        <Form.Item name="pictures" style={{ width: "100%", border: "2px dashed #aaa", borderRadius: "8px", padding: "2rem" }}>
          <div className="fjahasfkhkask" style={{  }}>
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={40}
              slidesPerView={1}
              style={{ width: "100%", height: "400px", padding: "1rem" }}
            >
              {pictures.map((picture, index) => (
                <SwiperSlide
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <img
                    src={picture}
                    alt={`Picture ${index + 1}`}
                    style={{ width: "600px", height: "400px" }}
                  />
                  <button
                    onClick={() => handleDeletePicture(index)}
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "10px",
                      background: "#b0b0b0",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "red",
                      borderRadius: "50%",
                      width: "22px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#8a8a8a")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#b0b0b0")
                    }
                  >
                    <CloseOutlined />
                  </button>
                </SwiperSlide>
              ))}
              {/* Add Picture Button */}
              <SwiperSlide
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    cursor: "pointer",
                    padding: "20px",
                    border: "2px dashed #aaa",
                    borderRadius: "8px",
                  }}
                >
                  Add picture
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAddPicture}
                  />
                </label>
              </SwiperSlide>
            </Swiper>
          </div>
        </Form.Item>

        <br></br>
        <br></br>

        {/* Submit button */}
        <Form.Item style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" onClick={() => handleSubmit(form)} style={{ width: "500px", height: "50px" }}>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {id ? "Update Laptop" : "Add Laptop"}
            </span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminProductDetailTab;