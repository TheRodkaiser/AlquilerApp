const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BlockedDate = sequelize.define("blocked_dates", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id: { type: DataTypes.INTEGER, allowNull: false },
  item_id: { type: DataTypes.INTEGER, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false
});

module.exports = BlockedDate;
