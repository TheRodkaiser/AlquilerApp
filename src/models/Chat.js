const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Message = require("./Message");
const User = require("./users");
const Item = require("./Item");

const Chat = sequelize.define("chats", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller_id: { type: DataTypes.INTEGER, allowNull: false },
  buyer_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  underscored: true
});

// Relación con mensajes
Chat.hasMany(Message, { foreignKey: "chat_id", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });
Chat.belongsTo(User, { as: "seller", foreignKey: "seller_id" });
Chat.belongsTo(User, { as: "buyer", foreignKey: "buyer_id" });
Chat.belongsTo(Item, { as: "item", foreignKey: "product_id" });


module.exports = Chat;
