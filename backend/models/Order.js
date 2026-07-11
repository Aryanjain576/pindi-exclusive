// ============================================================
// models/Order.js - PostgreSQL Order Model (Sequelize)
// ============================================================

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      razorpayPaymentId: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "cancelled"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: "razorpay",
      },
      customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryCity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
    },
    {
      timestamps: true,
    }
  );

  return Order;
};
