const User = require('../models/user'); 
const { createUserService, loginService, getUserService } = require('../services/userService');

// controllers/userController.js
const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const data = await createUserService(name, email, password);
        
        if (data && data._id) {
            return res.status(200).json({
                EC: 0,
                EM: "Đăng ký thành công",
                data: data  // ← Bao bọc trong object có cấu trúc rõ ràng
            });
        } else if (data === null) {
            return res.status(400).json({
                EC: 1,
                EM: "Email đã tồn tại"
            });
        } else {
            return res.status(500).json({
                EC: -1,
                EM: "Lỗi server"
            });
        }
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server"
        });
    }
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

// controllers/userController.js
const getAccount = async (req, res) => {
    try {
        // Tìm user trong database bằng email từ token
        const user = await User.findOne({ email: req.user.email }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                EC: 1,
                EM: "User not found"
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: "Success",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: -1,
            EM: "Server error"
        });
    }
}
// controllers/userController.js
const getCurrentUser = async (req, res) => {
    try {
        // req.user được set bởi middleware auth sau khi verify token
        if (!req.user) {
            return res.status(401).json({
                EC: 1,
                EM: "Unauthorized"
            });
        }

        // Tìm user trong database bằng email từ token
        const user = await User.findOne({ email: req.user.email }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                EC: 1,
                EM: "User not found"
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: "Success",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: -1,
            EM: "Server error"
        });
    }
}
module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    getCurrentUser
};