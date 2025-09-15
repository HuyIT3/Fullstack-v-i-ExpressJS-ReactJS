import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategoryLazyApi } from '../util/apis';
import { List, Spin, notification, Card, Image } from 'antd';
import { useInfiniteScroll } from 'ahooks';

const { Meta } = Card;

const ProductsPageLazy = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);
  const limit = 5;

  // Hàm fetch dữ liệu cho lazy load
  const loadMoreData = useCallback(async () => {
    try {
      const res = await getProductsByCategoryLazyApi(categoryId, limit, skipRef.current);
      if (res && res.EC === 0) {
        const newProducts = res.data;
        setProducts(prev => [...prev, ...newProducts]);
        skipRef.current += newProducts.length; // Cập nhật offset cho lần load tiếp theo

        // Nếu số sản phẩm trả về ít hơn limit, tức là đã hết dữ liệu
        if (newProducts.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Lazy load error: ", error);
      notification.error({ message: 'Lỗi', description: 'Lỗi tải thêm sản phẩm' });
    }
  }, [categoryId, limit]);

  // Hook từ ahooks để tự động gọi loadMoreData khi kéo xuống gần cuối
  const { loading, loadMore, loadingMore } = useInfiniteScroll(
    loadMoreData,
    {
      isNoMore: () => !hasMore, // Ngừng load khi không còn dữ liệu
      threshold: 100 // Khoảng cách đến cuối trang (pixel) để kích hoạt load
    }
  );

  // Load dữ liệu ban đầu khi categoryId thay đổi
  React.useEffect(() => {
    setProducts([]);
    skipRef.current = 0;
    setHasMore(true);
    loadMore(); // Gọi load dữ liệu đầu tiên
  }, [categoryId, loadMore]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Danh sách Sản phẩm (Lazy Load)</h2>
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
          dataSource={products}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={<Image alt="example" src={item.image} height={200} style={{ objectFit: 'cover' }} />}
              >
                <Meta 
                  title={item.name} 
                  description={
                    <>
                      <div>Giá: {item.price?.toLocaleString('vi-VN')} VND</div>
                      <div>{item.description}</div>
                    </>
                  } 
                />
              </Card>
            </List.Item>
          )}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {/* Hiển thị spinner khi đang tải thêm */}
          {loadingMore && <Spin />}
          {/* Thông báo hết dữ liệu */}
          {!hasMore && <div>~ Đã hiển thị hết dữ liệu ~</div>}
        </div>
      </Spin>
    </div>
  );
};

export default ProductsPageLazy;