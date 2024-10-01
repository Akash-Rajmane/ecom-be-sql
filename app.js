const express = require("express");
const sequelize = require("./utils/database");
const cors = require("cors");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const shopRoutes = require("./routes/shop");
const userRoutes = require("./routes/user");

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

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

CartItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(CartItem, { foreignKey: "productId" });

sequelize.sync().then(() => {
  app.listen(4000, () => {
    console.log("Server is running on port 4000");
  });
});
