const User = require("./users");
const Item = require("./Item");
const Favorite = require("./Favorite");
const ProductImage = require("./ProductImage");
const { useWatch } = require("react-hook-form");

const setupAssociations = () => {
  // Favorite associations
  Favorite.belongsTo(Item, { 
    foreignKey: "product_id", 
    as: "item",
    targetKey: "id"  // Add this to specify the target key in Item model
  });
  
  Favorite.belongsTo(User, { 
    foreignKey: "user_id", 
    as: "user",
    targetKey: "id"  // Add this if your User model uses 'id' as primary key
  });

  // Item associations
  Item.hasMany(Favorite, { 
    foreignKey: "product_id", 
    as: "favorites",
    sourceKey: "id"  // Add this to specify the source key
  });
  
  Item.hasMany(ProductImage, { 
    foreignKey: "product_id", 
    onDelete: "CASCADE" 
  });

  Item.belongsTo(User,
    {
      foreignKey: "owner_id",
      as:"owner"
    }
  );
  
  ProductImage.belongsTo(Item, { 
    foreignKey: "product_id" 
  });

  Item.hasMany(ProductImage, { 
    foreignKey: "product_id", 
    as: "images" 
  });
};

module.exports = setupAssociations;