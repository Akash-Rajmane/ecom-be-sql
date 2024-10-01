const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const User = require("../models/user");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();

    if (!products) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ products });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findByPk(prodId);

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to retrieve product" });
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const cartDetails = await Cart.findOne({
      where: { userId: req.user.id },
      attributes: { exclude: ["createdAt", "updatedAt"] }, // Exclude timestamps from Cart
      include: [
        {
          model: CartItem,
          as: "cartItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: { exclude: ["createdAt", "updatedAt"] }, // Exclude timestamps from Product
            },
          ],
        },
      ],
    });

    if (!cartDetails) {
      return res.status(404).json({ message: "No cart details found" });
    }

    res.status(200).json({ cartDetails });
  } catch (err) {
    console.log("Error fetching cart items:", err);
    res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};
