require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const path = req.originalUrl.split("?")[0]; // bỏ query string

    // White list các route public - CHỈ ĐỊNH RÕ RÀNG
    const whiteLists = [
        "/v1/api/register",
        "/v1/api/login",
        "/v1/api/products/search"
    ];

    // Kiểm tra các route category (có tham số)
    const isCategoryRoute = path.startsWith("/v1/api/category/") && 
                           (path.endsWith("/products") || path.endsWith("/products-lazy"));

    // Kiểm tra route gốc
    const isRootRoute = path === "/v1/api/";

    if (whiteLists.includes(path) || isCategoryRoute || isRootRoute) {
        return next();
    }

    // Nếu không phải whitelist → check token
    const token = req?.headers?.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: "Token không tồn tại"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            email: decoded.email,
            name: decoded.name,
            createday: "holdanit"
        };
        console.log(">>> check token: ", decoded);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token bị hết hạn/hoặc không hợp lệ"
        });
    }
};

module.exports = auth;