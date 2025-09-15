import React, { useState } from "react";
import { Input, Button, List, Card, Image, Pagination, Form, InputNumber } from "antd";
import { searchProductsApi } from "../util/apis";

const { Meta } = Card;

const SearchProductsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await searchProductsApi(params);
      if (res && res.data.EC === 0) {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    fetchData({ ...values, page: 1 });
  };

  const handlePageChange = (page) => {
    const values = form.getFieldsValue();
    fetchData({ ...values, page });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Tìm kiếm sản phẩm</h2>
      <Form layout="inline" form={form} onFinish={onFinish}>
        <Form.Item name="query">
          <Input placeholder="Từ khóa..." />
        </Form.Item>
        <Form.Item name="categoryId">
          <Input placeholder="Category ID" />
        </Form.Item>
        <Form.Item name="minPrice">
          <InputNumber placeholder="Giá từ" />
        </Form.Item>
        <Form.Item name="maxPrice">
          <InputNumber placeholder="Giá đến" />
        </Form.Item>
        <Form.Item name="minDiscount">
          <InputNumber placeholder="Khuyến mãi >=" />
        </Form.Item>
        <Form.Item name="minViews">
          <InputNumber placeholder="Lượt xem >=" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Tìm</Button>
        </Form.Item>
      </Form>

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={products}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={<Image src={item.image} height={200} style={{ objectFit: "cover" }} />}
            >
              <Meta
                title={item.name}
                description={
                  <>
                    <div>Giá: {item.price?.toLocaleString("vi-VN")} VND</div>
                    <div>Khuyến mãi: {item.discount}%</div>
                    <div>Lượt xem: {item.views}</div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Pagination
          current={pagination.currentPage}
          total={pagination.totalProducts}
          pageSize={5}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default SearchProductsPage;
