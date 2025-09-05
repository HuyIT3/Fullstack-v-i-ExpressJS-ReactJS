import { Button, Layout, Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setAuth({
            isAuthenticated: false,
            user: { email: "", name: "" }
        });
        navigate("/login");
    };

    const menuItems = [
        {
            key: 'home',
            label: <Link to="/">Home</Link>,
        },
        {
            key: 'user',
            label: <Link to="/user">Users</Link>,
        },
        auth.isAuthenticated ? {
            key: 'logout',
            label: <Button type="link" onClick={handleLogout}>Logout</Button>,
        } : {
            key: 'login',
            label: <Link to="/login">Login</Link>,
        }
    ];

    return (
        <AntHeader style={{ display: 'flex', alignItems: 'center' }}>
            <div className="demo-logo" />
            <Menu
                theme="dark"
                mode="horizontal"
                items={menuItems}
                style={{ flex: 1, minWidth: 0 }}
            />
        </AntHeader>
    );
};

export default Header;