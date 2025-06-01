import { Row, Col, Typography } from 'antd';

const { Title, Text } = Typography;

const AccountDashboard = () => {
  return (
    <div style={{ paddingLeft: '40px', marginTop: '-2px' }}>
      <Title level={4} style={{ marginBottom: '10px' }}>
        Account Information
      </Title>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}></div>

      <Row gutter={[16, 16]} style={{ paddingBottom: '20px' }}>
        <Col span={12}>
          <Text strong style={{ fontSize: '14px' }}>
            Contact Information
          </Text>
          <p style={{ fontSize: '14px' }}>Alex Driver</p>
          <p style={{ fontSize: '14px' }}>ExampleAdress@gmail.com</p>
          <div style={{ marginTop: '30px' }}>
            <a
              href="#"
              style={{
                fontSize: '14px',
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.target.style.color = '#0056b3')}
              onMouseOut={(e) => (e.target.style.color = '#1890ff')}
            >
              Edit
            </a>{' '}
            |
            <a
              href="#"
              style={{
                fontSize: '14px',
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: '8px',
              }}
              onMouseOver={(e) => (e.target.style.color = '#0056b3')}
              onMouseOut={(e) => (e.target.style.color = '#1890ff')}
            >
              Change Password
            </a>
          </div>
        </Col>
        <Col span={12}>
          <Text strong style={{ fontSize: '14px' }}>
            Newsletters
          </Text>
          <p style={{ fontSize: '14px' }}>
            You don’t subscribe to our newsletter.
          </p>
          <div style={{ marginTop: '60px' }}>
            <a
              href="#"
              style={{
                fontSize: '14px',
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.target.style.color = '#0056b3')}
              onMouseOut={(e) => (e.target.style.color = '#1890ff')}
            >
              Edit
            </a>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: '40px' }}></div>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Title
            level={4}
            style={{ display: 'inline-block', marginBottom: '0px' }}
          >
            Address Book
          </Title>
          <a
            href="#"
            style={{
              fontSize: '14px',
              marginLeft: '10px',
              color: '#1890ff',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.target.style.color = '#0056b3')}
            onMouseOut={(e) => (e.target.style.color = '#1890ff')}
          >
            Manage Addresses
          </a>
        </Col>
      </Row>

      <div
        style={{
          borderBottom: '1px solid #ccc',
          marginTop: '10px',
          marginBottom: '10px',
          width: '100%',
        }}
      ></div>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text strong style={{ fontSize: '14px' }}>
            Default Billing Address
          </Text>
          <p style={{ fontSize: '14px' }}>
            You have not set a default billing address.
          </p>
          <div style={{ marginTop: '40px' }}>
            <a
              href="#"
              style={{
                fontSize: '14px',
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.target.style.color = '#0056b3')}
              onMouseOut={(e) => (e.target.style.color = '#1890ff')}
            >
              Edit Address
            </a>
          </div>
        </Col>
        <Col span={12}>
          <Text strong style={{ fontSize: '14px' }}>
            Default Shipping Address
          </Text>
          <p style={{ fontSize: '14px' }}>
            You have not set a default shipping address.
          </p>
          <div style={{ marginTop: '40px' }}>
            <a
              href="#"
              style={{
                fontSize: '14px',
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.target.style.color = '#0056b3')}
              onMouseOut={(e) => (e.target.style.color = '#1890ff')}
            >
              Edit Address
            </a>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AccountDashboard;
