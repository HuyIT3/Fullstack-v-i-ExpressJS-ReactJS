import React, { useState } from 'react';
import { Form, Input, Button, notification, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../util/apis';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi(values.email);
      if (res && res.data && res.data.EC === 0) {
        notification.success({ message: 'Thành công', description: 'Kiểm tra email để reset password' });
        navigate('/login');
      } else {
        notification.error({ message: 'Lỗi', description: res.data?.EM || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      notification.error({ message: 'Lỗi', description: 'Lỗi server, thử lại sau' });
    }
    setLoading(false);
  };

  return (
    <Row justify="center" style={{ marginTop: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <div style={{ padding: '15px', margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <Form name="forgot" onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi yêu cầu reset
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;