const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Crear una reseña
router.post("/reviews", authMiddleware, reviewsController.createReview);

// Obtener todas las reseñas de un usuario
router.get("/reviews/:user_id", reviewsController.getUserReviews);

// Obtener el promedio de calificación de un usuario
router.get("/reviews/:user_id/average", reviewsController.getUserRating);

module.exports = router;
