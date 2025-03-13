const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductImage = sequelize.define("product_images", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: false
});

module.exports = ProductImage;
