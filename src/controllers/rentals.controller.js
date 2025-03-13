const Rental = require("../models/Rental");
const BlockedDate = require("../models/BlockedDate");
const { Op } = require("sequelize");

exports.createRental = async (req, res) => {
  try {
    const { item_id, start_date, end_date, total_price, deposit_paid } = req.body;
    const renter_id = req.user.id; // Tomar el ID del usuario autenticado (debe venir del middleware de autenticación)

    // Verificar si las fechas están bloqueadas
    const blocked = await BlockedDate.findOne({
      where: {
        item_id,
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
          { start_date: { [Op.lte]: start_date }, end_date: { [Op.gte]: end_date } }
        ]
      }
    });

    if (blocked) {
      return res.status(400).json({ error: "El artículo no está disponible en esas fechas." });
    }

    // Verificar si las fechas ya están reservadas para este artículo
    const existingRental = await Rental.findOne({
      where: {
        item_id,
        status: "confirmed",
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
          { start_date: { [Op.lte]: start_date }, end_date: { [Op.gte]: end_date } }
        ]
      }
    });

    if (existingRental) {
      return res.status(400).json({ error: "Este artículo ya está reservado en esas fechas." });
    }

    // Crear la reserva (SIN ID, Sequelize lo maneja automáticamente)
    const newRental = await Rental.create({
      renter_id,
      item_id,
      start_date,
      end_date,
      total_price,
      deposit_paid,
      status: "confirmed", // Establece el estado confirmado por defecto
    });

    res.status(201).json(newRental);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reservar el artículo." });
  }
};
