const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const Address = require("../models/address");
const sequelize = require("../utils/database");

exports.placeOrder = async (req, res, next) => {
  const { address } = req.body;
  let t;
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "price"] }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "No items in the cart" });
    }

    let defaultAddress;
    let addressId;
    if (!address) {
      defaultAddress = await Address.findOne({
        where: { userId: req.user.id, isDefault: true },
      });

      if (!defaultAddress) {
        return res.status(400).json({ message: "Default address not found" });
      }

      addressId = defaultAddress.id;
    }

    t = await sequelize.transaction();
    if (address) {
      const newAddress = await Address.create(
        {
          userId: req.user.id,
          fullName: address.fullName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landMark: address.landMark,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phoneNumber: address.phoneNumber,
          isDefault: address.isDefault,
        },
        { transaction: t }
      );
      addressId = newAddress.id;
    }

    let order = await Order.create(
      {
        userId: req.user.id,
        totalAmount: cart.totalAmount,
        addressId: addressId,
      },
      { transaction: t }
    );

    let orderItems = [];
    for (const cartItem of cartItems) {
      let orderItem = await OrderItem.create(
        {
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: parseFloat(
            (cartItem.product.price * cartItem.quantity).toFixed(2)
          ),
        },
        { transaction: t }
      );

      orderItems.push(orderItem);
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    cart.totalAmount = 0;
    await cart.save({ transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Order created successfully",
      order: {
        orderItems,
        totalAmount: order.totalAmount,
        address: address || defaultAddress,
      },
    });
  } catch (err) {
    console.log(err);
    if (t) await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};
