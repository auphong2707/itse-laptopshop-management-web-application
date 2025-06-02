import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "swiper/css";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  notification,
  message,
  Upload,
  Image
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Divider } from "antd";

const transformFormData = (values) => {
  return {
    brand: values.brand || "",
    sub_brand: values.sub_brand || "",
    name: values.name || "",
    description: values.description || "",
    usage_type: values.usage_type || "general",
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
    product_image_mini: values.pictures.map((file) => file.filepath || file.response.filepath),
    quantity: values.quantity ? parseInt(values.quantity, 10) : 0,
    original_price: values.original_price
      ? parseInt(values.original_price, 10)
      : 0,
    sale_price: values.sale_price ? parseInt(values.sale_price, 10) : 0,
  };
};

const getBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
  });

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

const AdminProductDetailTab = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams();

  const [sessionId, _] = useState(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  console.log("Session ID:", sessionId);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const MAX_FILES = 8;
  const beforeUpload = (file, fileList) => {
    const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!okType) message.error("Chỉ nhận JPG/PNG/WebP!");
    const okSize = file.size / 1024 / 1024 < 2;
    if (!okSize) message.error("Ảnh phải < 2 MB!");
    const current = (form.getFieldValue("pictures") || []).length;
    if (current + fileList.length > MAX_FILES) {
      message.error(`Tối đa ${MAX_FILES} ảnh!`);
      return Upload.LIST_IGNORE;
    }
    return okType && okSize;
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const pictures = Form.useWatch('pictures', form) || [];

  useEffect(() => {
    if (!id) {
      form.resetFields();
      return;
    }

    axios
      .get(`http://localhost:8000/laptops/id/${id}`)
      .then(({ data }) => {
        form.setFieldsValue(data);

        if (data.product_image_mini) {
          try {
            const urls = JSON.parse(data.product_image_mini);
            const list = urls.map((u, i) => ({
              uid: `old-${i}`,
              name: `img_${i}.jpg`,
              status: 'done',
              url: `http://localhost:8000${u}`,
              filepath: u,
            }));
            form.setFieldValue('pictures', list);
          } catch (e) {
            console.error('Parse image error', e);
          }
        }
      })
      .catch(() => form.resetFields());
  }, [id]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleSubmit = async () => {
    const raw = form.getFieldsValue();

    const payload = {
      ...transformFormData(raw)
    };

    try {
      console.log("Submitting payload:", payload);
      if (id) {
        await axios.put(`http://localhost:8000/laptops/${id}`, payload);
        notification.success({ message: 'Update sucessfully! Please wait for at most 2 minutes to see the changes.' });
      } else {
        await axios.post('http://localhost:8000/laptops/', payload);
        notification.success({ message: 'Insert successfully! Please wait for at most 2 minutes to see the changes.' });
        form.resetFields();
      }
      navigate('/admin/inventory/all');
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.response?.data || 'Something went wrong!',
      });
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
          <InputNumber defaultValue={0} style={{ width: 300}} />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Original Price</span>}
          rules={[{ required: true, message: "Original Price is required" }]}
          name="original_price"
        >
          <InputNumber suffix="đ" style={{ width: 300}} />
        </Form.Item>
        <Form.Item
          label={<span style={{fontWeight: "bold"}}>Sale Price</span>}
          rules={[{ required: true, message: "Sale Price is required" }]}
          name="sale_price"
        >
          <InputNumber suffix="đ" style={{ width: 300}} />
        </Form.Item>

        {/* Pictures */}
        <CustomDivider label="Pictures" />
        <Form.Item
          name="pictures"
          label={<span style={{fontWeight: "bold"}}>Images</span>}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Please select at least 1 image!' }]}
        >
          <Upload
            listType="picture-card"
            accept="image/*"
            multiple
            beforeUpload={beforeUpload}
            fileList={pictures}
            onChange={({ fileList }) =>
              form.setFieldValue('pictures', fileList)
            }
            onPreview={handlePreview}
            action={`http://localhost:8000/laptops/upload-temp/${sessionId}/${sessionId}${pictures.length + 1}.jpg`}
          >
            {pictures.length >= MAX_FILES ? null : (
              <button type="button" style={{ border: 0, background: 'none' }}>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            )}
          </Upload>
        </Form.Item>

        {/* PREVIEW MODAL */}
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            src={previewImage}
            preview={{
              visible: previewOpen,
              onVisibleChange: setPreviewOpen,
              afterOpenChange: (v) => !v && setPreviewImage(''),
            }}
          />
        )}

        <br></br>
        <br></br>

        {/* Submit button */}
        <Form.Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ width: 500, height: 50 }}
          >
            <span style={{ fontWeight: "bold", fontSize: 16 }}>
              {id ? "Update Laptop" : "Add Laptop"}
            </span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminProductDetailTab;