const express = require("express");

const orderController = require("../controllers/order");
const checkAuth = require("../middlewares/auth");

const router = express.Router();

router.post("/place", checkAuth, orderController.placeOrder);

module.exports = router;
