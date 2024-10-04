const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const sequelize = require("../utils/database");

exports.getProducts = async (req, res, next) => {
  try {
    let products = await Product.findAll();

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
    let product = await Product.findByPk(prodId);

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to retrieve product" });
  }
};

/*
exports.getCartItems = async (req, res, next) => {
  try {
    let cartDetails = await Cart.findOne({
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
              attributes: ["id", "name", "price"],
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
*/

exports.getCart = async (req, res, next) => {
  try {
    // Fetch cart details from the view
    let cartDetails = await sequelize.query(
      "SELECT * FROM v_cartdetails WHERE userId = :userId",
      {
        replacements: { userId: req.user.id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!cartDetails || cartDetails.length === 0) {
      return res.status(404).json({ message: "No cart details found" });
    }

    // Calculate the total amount for the cart
    const totalAmount = await sequelize.query(
      "SELECT CalculateCartTotalAmount(:cartId) AS totalAmount",
      {
        replacements: { cartId: cartDetails[0].cartId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Add total amount to the response
    res.status(200).json({
      cartDetails,
      totalAmount: totalAmount[0].totalAmount,
    });
  } catch (err) {
    console.log("Error fetching cart items:", err);
    res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  let t;
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    t = await sequelize.transaction();

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save({ transaction: t });
    } else {
      cartItem = await CartItem.create(
        {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
        { transaction: t }
      );
    }

    cart.totalAmount =
      parseFloat(cart.totalAmount) +
      parseFloat((product.price * quantity).toFixed(2));

    await cart.save({ transaction: t });

    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "name", "price"] }],
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      message: "Product added to cart successfully!",
      cart: {
        cartItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.log(err);
    if (t) await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteFromCart = async (req, res, next) => {
  let productId = req.params.productId;
  let t;
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    t = await sequelize.transaction();
    let product = await Product.findByPk(productId);

    cart.totalAmount =
      parseFloat(cart.totalAmount) -
      parseFloat((product.price * cartItem.quantity).toFixed(2));

    await cart.save({ transaction: t });
    await cartItem.destroy({ transaction: t });

    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "name", "price"] }],
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      message: "Product removed from cart successfully!",
      cart: {
        cartItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.log(err);
    if (t) await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.changeQuantityOfCartItem = async (req, res, next) => {
  let productId = req.params.productId;
  let { quantity } = req.body;
  let t;

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    t = await sequelize.transaction();
    let product = await Product.findByPk(productId);

    cart.totalAmount =
      parseFloat(cart.totalAmount) +
      parseFloat((product.price * (quantity - cartItem.quantity)).toFixed(2));

    await cart.save({ transaction: t });

    cartItem.quantity = quantity;
    await cartItem.save({ transaction: t });

    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "name", "price"] }],
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      message: "Updated product quantity in the cart successfully!",
      cart: {
        cartItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.error("Error updating cart item quantity:", err);
    if (t) await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};
