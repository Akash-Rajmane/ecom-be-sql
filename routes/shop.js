const express = require("express");

const shopController = require("../controllers/shop");
const checkAuth = require("../middlewares/auth");

const router = express.Router();

router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", checkAuth, shopController.getCart);
router.post("/cart/add", checkAuth, shopController.addToCart);
router.delete(
  "/cart/delete/:productId",
  checkAuth,
  shopController.deleteFromCart
);
router.patch(
  "/cart/update/:productId",
  checkAuth,
  shopController.changeQuantityOfCartItem
);

module.exports = router;
