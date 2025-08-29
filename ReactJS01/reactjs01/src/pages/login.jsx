import React, { useContext, useState } from 'react';
import { Form, Input, Button, notification, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { loginApi } from '../util/apis';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi(values.email, values.password);
      if (res && res.data && res.data.EC === 0) {
        login(res.data.user, res.data.access_token);
        notification.success({ message: 'Login Success' });
        navigate('/');
      } else {
        notification.error({ message: 'Login Failed', description: res.data?.EM });
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Server error' });
    }
    setLoading(false);
  };

  return (
    <Row justify="center" style={{ marginTop: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default LoginPage;