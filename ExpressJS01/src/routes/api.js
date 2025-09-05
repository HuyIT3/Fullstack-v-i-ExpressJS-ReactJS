const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { getProductsByCategory, getProductsByCategoryLazyLoad } = require('../controllers/productController');

const routerAPI = express.Router();

// public routes
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

routerAPI.all("*", auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api");
});


routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);
// API Phân trang: GET /v1/api/category/:categoryId/products?page=1&limit=5
routerAPI.get("/category/:categoryId/products", getProductsByCategory);

// API Lazy Loading: GET /v1/api/category/:categoryId/products-lazy?limit=5&skip=0
routerAPI.get("/category/:categoryId/products-lazy", getProductsByCategoryLazyLoad);

module.exports = routerAPI;