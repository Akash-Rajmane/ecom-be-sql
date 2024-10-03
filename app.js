const express = require("express");
const sequelize = require("./utils/database");
const cors = require("cors");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const Address = require("./models/address");

const shopRoutes = require("./routes/shop");
const userRoutes = require("./routes/user");
const orderRoutes = require("./routes/order");

const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/shop", shopRoutes);
app.use("/api/users", userRoutes);
app.use("/api/order", orderRoutes);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

CartItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(CartItem, { foreignKey: "productId" });

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

User.hasMany(Address, { foreignKey: "userId" });
Address.belongsTo(User, { foreignKey: "userId" });

Order.belongsTo(Address, { foreignKey: "addressId" });
Address.hasMany(Order, { foreignKey: "addressId" });

// Global error-handling middleware
app.use((err, req, res, next) => {
  // console.error(err.stack); // Log the error stack for debugging
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

sequelize.sync().then(() => {
  app.listen(4000, () => {
    console.log("Server is running on port 4000");
  });
});
