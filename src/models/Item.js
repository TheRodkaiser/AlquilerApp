const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ProductImage = require("./ProductImage");
const Favorite = require("./Favorite");


const Item = sequelize.define("items", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id: { type: DataTypes.INTEGER},
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price_per_day: { type: DataTypes.FLOAT, allowNull: false },
  price_per_week: { type: DataTypes.FLOAT, allowNull: true },
  price_per_month: { type: DataTypes.FLOAT, allowNull: true },
  deposit: { type: DataTypes.FLOAT, allowNull: false },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  condition: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true
});

module.exports = Item;
