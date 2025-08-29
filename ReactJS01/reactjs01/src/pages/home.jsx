import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Title level={2}>Welcome to FullStack App</Title>
    </div>
  );
};

export default HomePage;