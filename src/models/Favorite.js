const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
  "favorites",  // This should match your database table name
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',  // This should match your users table name
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'items',  // This should match your items table name
        key: 'id'
      }
    }
  },
  {
    timestamps: false,
    tableName: 'favorites'  // Explicitly set the table name
  }
);

module.exports = Favorite;