const BlockedDate = require("../models/BlockedDate");
const Item = require("../models/Item");
const { Op } = require("sequelize");

exports.blockDates = async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar si el usuario es el dueño del ítem
    const item = await Item.findByPk(item_id);
    if (!item) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para bloquear fechas de este artículo" });
    }

    // Guardar la fecha bloqueada
    const blockedDate = await BlockedDate.create({
      owner_id: req.user.id,
      item_id,
      start_date,
      end_date
    });

    res.status(201).json({ message: "Fechas bloqueadas correctamente", blockedDate });
  } catch (error) {
    console.error("Error al bloquear fechas:", error);
    res.status(500).json({ error: "Error al bloquear fechas" });
  }
};
