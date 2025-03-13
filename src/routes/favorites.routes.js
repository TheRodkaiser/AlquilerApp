const express = require("express");
const { addFavorite, removeFavorite, getFavorites, isFavorite } = require("../controllers/favorites.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas protegidas con autenticación
router.post("/", authMiddleware, addFavorite); // Añadir a favoritos
router.delete("/:product_id", authMiddleware, removeFavorite); // Eliminar de favoritos
router.get("/", authMiddleware, getFavorites); // Obtener favoritos
router.get("/:product_id", authMiddleware, isFavorite); // Verificar si está en favoritos

module.exports = router;
