const Favorite = require("../models/Favorite");
const Item = require("../models/Item");

// ➕ Añadir un producto a favoritos
exports.addFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    await Favorite.create({ user_id, product_id });

    res.status(201).json({ message: "Producto añadido a favoritos" });
  } catch (error) {
    console.error("Error al añadir a favoritos:", error);
    res.status(500).json({ error: "Error al añadir a favoritos" });
  }
};

// ❌ Eliminar un producto de favoritos
exports.removeFavorite = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    await Favorite.destroy({ where: { user_id, product_id } });

    res.status(200).json({ message: "Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error);
    res.status(500).json({ error: "Error al eliminar de favoritos" });
  }
};

// 📜 Obtener la lista de favoritos de un usuario
exports.getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;

    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [{ 
        model: Item,
        as: 'item'  // This needs to match the alias in the association
      }]
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
};
// ✅ Verificar si un producto está en favoritos
exports.isFavorite = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const exists = await Favorite.findOne({ where: { user_id, product_id } });

    res.status(200).json({ isFavorite: !!exists });
  } catch (error) {
    console.error("Error al verificar favorito:", error);
    res.status(500).json({ error: "Error al verificar favorito" });
  }
};
