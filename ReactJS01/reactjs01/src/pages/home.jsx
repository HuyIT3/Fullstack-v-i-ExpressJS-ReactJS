import React, { useState, useEffect } from 'react';
import { 
  HomeOutlined, 
  UserOutlined, 
  ShoppingOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { 
  Result, 
  Card, 
  Button, 
  Row, 
  Col, 
  Descriptions, 
  Avatar,
  Divider,
  notification,
  Select,
  Space
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAccountApi } from '../util/apis'; // SỬA THÀNH getAccountApi

const { Option } = Select;

const mockCategories = [
  {
    _id: "68ba80475fedfb345f7bf12f",
    name: "Điện thoại",
    description: "Các dòng điện thoại thông minh"
  },
  {
    _id: "68ba80475fedfb345f7bf131", 
    name: "Laptop",
    description: "Máy tính xách tay cho công việc và giải trí"
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(mockCategories);

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }

            // ĐÃ SỬA: gọi getAccountApi() đúng cách
            const res = await getAccountApi();
            console.log("API Response:", res); // Thêm dòng này để debug
            
            if (res && res.EC === 0) {
                setUser(res.data);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: res?.EM || 'Không thể tải thông tin người dùng'
                });
            }
        } catch (error) {
            console.error("Fetch user error: ", error);
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi khi tải thông tin người dùng'
            });
        } finally {
            setLoading(false);
        }
    };

    fetchUserProfile();
  }, []);


   
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    notification.success({
      message: 'Đăng xuất',
      description: 'Bạn đã đăng xuất thành công'
    });
  };

  const handleNavigateToProducts = () => {
    if (selectedCategory) {
      // Điều hướng đến trang sản phẩm của category được chọn
      navigate(`/category/${selectedCategory}/products`);
    } else {
      // Nếu không chọn category, điều hướng đến trang tất cả sản phẩm
      navigate('/products');
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Hàm này để lấy danh sách categories từ API (nếu có)
  const fetchCategories = async () => {
    try {
      // Giả sử bạn có API getCategoriesApi
      // const res = await getCategoriesApi();
      // if (res && res.EC === 0) {
      //   setCategories(res.data);
      // }
    } catch (error) {
      console.error("Fetch categories error: ", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<HomeOutlined />}
        title="JSON Web Token (React/Node.JS) - iotstar.vn"
        extra={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              placeholder="Chọn danh mục sản phẩm"
              style={{ width: 250 }}
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            
            <Button 
              type="primary" 
              icon={<ShoppingOutlined />} 
              size="large"
              onClick={handleNavigateToProducts}
              disabled={!selectedCategory}
            >
              {selectedCategory ? `Xem ${categories.find(c => c._id === selectedCategory)?.name}` : 'Xem Sản Phẩm'}
            </Button>
            
            {!selectedCategory && (
              <Button 
                type="default" 
                icon={<ShoppingOutlined />} 
                size="large"
                onClick={() => navigate('/products')}
              >
                Xem Tất Cả Sản Phẩm
              </Button>
            )}
          </Space>
        }
      />
      
      <Divider>Thông Tin Người Dùng</Divider>
      
      {user ? (
        <Row justify="center">
          <Col xs={24} md={16} lg={12}>
            <Card 
              title="Hồ Sơ Cá Nhân" 
              loading={loading}
              extra={
                <Button 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                  danger
                >
                  Đăng Xuất
                </Button>
              }
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
              </div>
              
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ và Tên">
                  {user.name || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {user.role === 'User' ? 'Người dùng' : user.role}
                </Descriptions.Item>
                <Descriptions.Item label="ID">
                  {user._id}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row justify="center">
          <Col xs={24} md={16} lg={12}>
            <Card title="Trạng Thái Đăng Nhập">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p>Bạn chưa đăng nhập vào hệ thống</p>
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    style={{ marginRight: 8 }}
                    onClick={() => navigate('/login')}
                  >
                    Đăng Nhập
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Đăng Ký
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default HomePage;