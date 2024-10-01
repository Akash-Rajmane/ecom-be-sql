const express = require("express");

const shopController = require("../controllers/shop");
const checkAuth = require("../middlewares/auth");

const router = express.Router();

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", checkAuth, shopController.getCartItems);

module.exports = router;
