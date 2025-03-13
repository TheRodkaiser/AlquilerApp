const sequelize = require("../config/database");
const User = require("./users");
const Item = require("./Item");
const Rental = require("./Rental");
const Rental = require("./Chat");
const Rental = require("./Message");


// Definir relaciones
User.hasMany(Rental, { foreignKey: "renter_id" });
Rental.belongsTo(User, { foreignKey: "renter_id" });


Item.hasMany(Rental, { foreignKey: "item_id" });
Rental.belongsTo(Item, { foreignKey: "item_id" });

module.exports = { sequelize, User, Item, Rental, Chat, Message };