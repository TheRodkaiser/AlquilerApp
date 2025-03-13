const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("reviews", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rental_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewer_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewed_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false
});

module.exports = Review;
