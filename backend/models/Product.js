// ============================================================
// models/Product.js - PostgreSQL Product Model (Sequelize)
// ============================================================

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: null,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM("suits", "fabrics", "dupattas", "accessories"),
        defaultValue: "suits",
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: {
          min: 0,
        },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 4.0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Product;
};
