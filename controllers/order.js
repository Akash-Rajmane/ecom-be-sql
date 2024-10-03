const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const Address = require("../models/address");

exports.placeOrder = async (req, res, next) => {
  const { address } = req.body;
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    let addressId;
    let defaultAddress;

    if (address) {
      const newAddress = await Address.create({
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
      });
      addressId = newAddress.id;
    } else {
      defaultAddress = await Address.findOne({
        where: { userId: req.user.id, isDefault: true },
      });
      addressId = defaultAddress.id;
    }

    let order = await Order.create({
      userId: req.user.id,
      totalAmount: cart.totalAmount,
      addressId: addressId,
    });

    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "price"] }],
    });

    let orderItems = [];
    for (const cartItem of cartItems) {
      let orderItem = await OrderItem.create({
        orderId: order.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: parseFloat(
          (cartItem.product.price * cartItem.quantity).toFixed(2)
        ),
      });

      orderItems.push(orderItem);
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalAmount = 0;
    await cart.save();

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
    res.status(500).json({ error: "Internal Server Error" });
  }
};
