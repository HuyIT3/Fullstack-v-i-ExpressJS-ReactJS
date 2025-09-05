import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
// Import 2 trang sản phẩm mới
import ProductsPage from './pages/ProductsPage.jsx';
import ProductsPageLazy from './pages/ProductsPageLazy.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "user", element: <UserPage /> },
        {
    path: "category/:categoryId/products",
    element: <ProductsPage />
  },
  // Thêm route cho trang sản phẩm (Lazy Loading)
  {
    path: "category/:categoryId/products-lazy",
    element: <ProductsPageLazy />
   },
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },

]);



ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>,
);