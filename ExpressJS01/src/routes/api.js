const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { getProductsByCategory, getProductsByCategoryLazyLoad, searchProductsController } = require('../controllers/productController');

const routerAPI = express.Router();

// ✅ Public routes (không cần token)
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/category/:categoryId/products", getProductsByCategory);
routerAPI.get("/category/:categoryId/products-lazy", getProductsByCategoryLazyLoad);
routerAPI.get("/products/search", searchProductsController);

// ✅ Các route còn lại sẽ yêu cầu token
routerAPI.all("*", auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api");
});
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI;
