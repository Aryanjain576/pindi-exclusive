// ============================================================
// models/Cart.js - PostgreSQL Cart Model (Sequelize)
// ============================================================

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cart = sequelize.define(
    "Cart",
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
        unique: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Cart;
};
