require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const white_lists = [
        "/",
        "/register",
        "/login",
        "/v1/api/category/:categoryId/products",
        "/v1/api/category/:categoryId/products-lazy"
    ];

    // Kiểm tra nếu req.originalUrl khớp với một route trong white_lists
    const isWhiteListed = white_lists.some(item => {
        if (item.includes(':categoryId')) {
            // So sánh phần tĩnh của URL (bỏ qua categoryId cụ thể và query string)
            const staticPath = req.originalUrl.split('?')[0]; // Loại bỏ query string
            return staticPath.startsWith('/v1/api/category/') && 
                   (staticPath.endsWith('/products') || staticPath.endsWith('/products-lazy'));
        }
        return req.originalUrl === `/v1/api${item}`;
    });

    if (isWhiteListed) {
        next();
    } else {
        if (req?.headers?.authorization?.split(' ')[1]) {
            const token = req.headers.authorization.split(' ')[1];
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
        } else {
            return res.status(401).json({
                message: "Token không tồn tại"
            });
        }
    }
};

module.exports = auth;