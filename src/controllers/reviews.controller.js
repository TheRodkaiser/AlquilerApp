const Review = require("../models/Review");
const Rental = require("../models/Rental");

exports.createReview = async (req, res) => {
  try {
    const { rental_id, reviewed_id, rating, comment } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que la reserva existe y está completada
    const rental = await Rental.findByPk(rental_id);
    if (!rental) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    
    if (rental.status !== "completed") {
      return res.status(400).json({ error: "No puedes calificar una reserva que no ha sido completada." });
    }

    // Verificar que el usuario es parte de la reserva
    if (rental.renter_id !== req.user.id && rental.owner_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para calificar esta reserva." });
    }

    // Crear la reseña
    const review = await Review.create({
      rental_id,
      reviewer_id: req.user.id,
      reviewed_id,
      rating,
      comment
    });

    res.status(201).json({ message: "Reseña creada correctamente", review });
  } catch (error) {
    console.error("Error al crear la reseña:", error);
    res.status(500).json({ error: "Error al crear la reseña." });
  }
};

exports.getUserReviews = async (req, res) => {
    try {
      const { user_id } = req.params;
  
      // Obtener todas las reseñas de un usuario
      const reviews = await Review.findAll({
        where: { reviewed_id: user_id },
        order: [["created_at", "DESC"]]
      });
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
      res.status(500).json({ error: "Error al obtener las reseñas." });
    }
  };

const { Sequelize } = require("sequelize");

  exports.getUserRating = async (req, res) => {
    try {
      const { user_id } = req.params;
  
      // Calcular el promedio de calificación
      const result = await Review.findOne({
        where: { reviewed_id: user_id },
        attributes: [[Sequelize.fn("AVG", Sequelize.col("rating")), "average_rating"]]
      });
  
      res.status(200).json({ user_id, average_rating: result.get("average_rating") || 0 });
    } catch (error) {
      console.error("Error al obtener la calificación:", error);
      res.status(500).json({ error: "Error al obtener la calificación del usuario." });
    }
  };
  