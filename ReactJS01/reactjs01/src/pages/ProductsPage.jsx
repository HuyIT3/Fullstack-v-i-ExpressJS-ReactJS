// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchProductsApi } from '../util/apis';
import { 
  List, 
  Pagination, 
  Spin, 
  notification, 
  Card, 
  Image, 
  Input, 
  Form, 
  Button, 
  Slider, 
  InputNumber, 
  Row, 
  Col,
  Select 
} from 'antd';

const { Meta } = Card;
const { Search } = Input;
const { Option } = Select;

const ProductsPage = () => {
  const { categoryId } = useParams();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({ products: [], pagination: {} });
  const [filters, setFilters] = useState({
    query: '',
    categoryId: categoryId || '',
    minPrice: 0,
    maxPrice: 100000000,
    minDiscount: 0,
    minViews: 0,
    page: 1,
    limit: 5,
    sortBy: 'views',
    sortOrder: 'desc'
  });

  const fetchProducts = async (updatedFilters) => {
    setLoading(true);
    try {
      const res = await searchProductsApi(updatedFilters);
      if (res && res.EC === 0) {
        setProductData(res.data);
      } else {
        notification.error({ message: 'Lỗi', description: res.EM || 'Không thể tải sản phẩm' });
      }
    } catch (error) {
      console.error("Fetch products error: ", error);
      notification.error({ message: 'Lỗi', description: 'Lỗi kết nối' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      const newFilters = { ...filters, categoryId, page: 1 };
      setFilters(newFilters);
      fetchProducts(newFilters);
    } else {
      fetchProducts(filters);
    }
  }, [categoryId]);

  const handleSearch = (value) => {
    const newFilters = { ...filters, query: value, page: 1 };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const handleFilterSubmit = (values) => {
    const newFilters = { ...filters, ...values, page: 1 };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('_');
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Danh sách Sản phẩm (Tìm kiếm & Lọc)</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <Search 
            placeholder="Tìm kiếm sản phẩm (hỗ trợ tìm kiếm mờ)..." 
            onSearch={handleSearch} 
            enterButton 
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select 
            defaultValue="views_desc" 
            style={{ width: '100%' }} 
            onChange={handleSortChange}
          >
            <Option value="views_desc">Xem nhiều nhất</Option>
            <Option value="price_asc">Giá thấp đến cao</Option>
            <Option value="price_desc">Giá cao đến thấp</Option>
            <Option value="discount_desc">Khuyến mãi nhiều nhất</Option>
            <Option value="createdAt_desc">Mới nhất</Option>
          </Select>
        </Col>
      </Row>

      <Form 
        layout="vertical" 
        onFinish={handleFilterSubmit} 
        initialValues={{
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minDiscount: filters.minDiscount,
          minViews: filters.minViews
        }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Khoảng giá (VND)" name="priceRange">
              <Slider
                range
                min={0}
                max={100000000}
                step={10000}
                defaultValue={[filters.minPrice, filters.maxPrice]}
                onAfterChange={(value) => {
                  setFilters({...filters, minPrice: value[0], maxPrice: value[1]});
                }}
              />
            </Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name="minPrice">
                  <InputNumber 
                    min={0} 
                    max={100000000} 
                    placeholder="Từ" 
                    style={{ width: '100%' }}
                    onChange={(value) => setFilters({...filters, minPrice: value})}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxPrice">
                  <InputNumber 
                    min={0} 
                    max={100000000} 
                    placeholder="Đến" 
                    style={{ width: '100%' }}
                    onChange={(value) => setFilters({...filters, maxPrice: value})}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          
          <Col span={4}>
            <Form.Item label="Khuyến mãi tối thiểu (%)" name="minDiscount">
              <InputNumber 
                min={0} 
                max={100} 
                style={{ width: '100%' }}
                onChange={(value) => setFilters({...filters, minDiscount: value})}
              />
            </Form.Item>
          </Col>
          
          <Col span={4}>
            <Form.Item label="Lượt xem tối thiểu" name="minViews">
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                onChange={(value) => setFilters({...filters, minViews: value})}
              />
            </Form.Item>
          </Col>
          
          <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
                Áp dụng Lọc
              </Button>
              <Button 
                onClick={() => {
                  const resetFilters = {
                    query: '',
                    categoryId: categoryId || '',
                    minPrice: 0,
                    maxPrice: 100000000,
                    minDiscount: 0,
                    minViews: 0,
                    page: 1,
                    limit: 12,
                    sortBy: 'views',
                    sortOrder: 'desc'
                  };
                  setFilters(resetFilters);
                  fetchProducts(resetFilters);
                }}
              >
                Đặt lại
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Spin spinning={loading}>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={productData.products}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={<Image
  alt={item.name}
  src={`http://localhost:8080/uploads/${item.image}`}
  height={200}
  width="100%"
  style={{ objectFit: 'cover' }}
/>

}
              >
                <Meta 
                  title={item.name} 
                  description={
                    <>
                      <div>Giá: {item.price?.toLocaleString('vi-VN')} VND</div>
                      {item.discount > 0 && <div>Khuyến mãi: {item.discount}%</div>}
                      <div>Lượt xem: {item.views}</div>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {item.description}
                      </div>
                    </>
                  } 
                />
              </Card>
            </List.Item>
          )}
        />
        
        {productData.pagination && productData.pagination.totalProducts > 0 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Pagination
              current={productData.pagination.currentPage || 1}
              total={productData.pagination.totalProducts || 0}
              pageSize={filters.limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} của ${total} sản phẩm`
              }
            />
          </div>
        )}
        
        {productData.products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm</p>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ProductsPage;