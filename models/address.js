const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const User = require("../models/user");

const Address = sequelize.define(
  "address",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      index: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Flat, House no., Building, Company, Apartment",
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Area, Street, Sector, Village",
    },
    landMark: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "isDefault"], // Composite index
      },
    ],
  }
);

module.exports = Address;
