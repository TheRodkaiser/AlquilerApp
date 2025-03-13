const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./users");
const Item = require("./Item");

const Rental = sequelize.define("rentals", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  renter_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: "id" }
  },
  item_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Item, key: "id" }
  },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  deposit_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { 
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"), 
    defaultValue: "pending"
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false, 
  underscored: true
});

module.exports = Rental;
