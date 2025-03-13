const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("messages", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chat_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  underscored: true
});

module.exports = Message;
