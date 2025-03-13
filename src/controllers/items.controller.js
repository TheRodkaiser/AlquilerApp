const Item = require("../models/Item");
const Rental = require("../models/Rental");
const User = require("../models/users");
const ProductImage = require("../models/ProductImage");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");


exports.createItem = async (req, res) => {
  try {
    const { title, description, price_per_day, price_per_week, price_per_month, deposit, category_id, condition, location, status } = req.body;
    
    // Verificar que el usuario está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    created_at = updated_at = Date.now();

    // Crear el producto en la base de datos
    const newItem = await Item.create({
      owner_id: req.user.id, // Usuario autenticado
      title,
      description,
      price_per_day,
      price_per_week,
      price_per_month,
      deposit,
      category_id,
      condition,
      location,
      status,
      created_at,
      updated_at
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price_per_day, price_per_week, price_per_month, deposit, category_id, condition, location, status } = req.body;

    // Buscar el producto
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar que el usuario autenticado es el dueño del producto
    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para modificar este producto" });
    }

    // Actualizar los campos permitidos
    await item.update({
      title: title || item.title,
      description: description || item.description,
      price_per_day: price_per_day || item.price_per_day,
      price_per_week: price_per_week || item.price_per_week,
      price_per_month: price_per_month || item.price_per_month,
      deposit: deposit || item.deposit,
      category_id: category_id || item.category_id,
      condition: condition || item.condition,
      location: location || item.location,
      status: status || item.status
    });

    res.status(200).json({ message: "Producto actualizado", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el producto
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar que el usuario autenticado es el dueño del producto
    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este producto" });
    }

    // Eliminar el producto
    await item.destroy();

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

// Get Item by id

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el artículo en la base de datos
    const item = await Item.findByPk(id, {
      include: [{
        model: User,
        as: "owner",
        attributes: ["id", "username", "location", "profile_picture"] // Solo incluimos los campos que queremos mostrar
      },
      {
        model: ProductImage,
        as: "images",
        attributes: ["id", "image_url"]
      }]
    });
    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los detalles del producto" });
  }
};



// Búsqueda de items
exports.getItems = async (req, res) => {
  try {
    const { search, category_id, min_price, max_price, location, condition, status, sort, start_date, end_date} = req.query;

    // Crear un objeto con los filtros dinámicos
    let filters = {};

    if (search) {
      filters[Op.or] = [
        Sequelize.literal(`unaccent(title) ILIKE unaccent('%${search}%')`),
        Sequelize.literal(`unaccent(description) ILIKE unaccent('%${search}%')`)
      ];
    }

    if (category_id) {
      filters.category_id = category_id;
    }

    if (min_price || max_price) {
      filters.price_per_day = {};
      if (min_price) filters.price_per_day[Op.gte] = parseFloat(min_price);
      if (max_price) filters.price_per_day[Op.lte] = parseFloat(max_price);
    }

    if (location) {
      filters[Op.and] = Sequelize.literal(`unaccent(location) ILIKE unaccent('%${location}%')`);
    }

    if (condition) {
      filters.condition = condition;
    }

    if (status) {
      filters.status = status;
    }

    // Excluir artículos reservados en las fechas especificadas
    if (start_date && end_date) {
      const reservedItems = await Reservation.findAll({
        attributes: ["item_id"],
        where: {
          status: "confirmed",
          [Op.or]: [
            { start_date: { [Op.between]: [start_date, end_date] } },
            { end_date: { [Op.between]: [start_date, end_date] } },
            { start_date: { [Op.lte]: start_date }, end_date: { [Op.gte]: end_date } }
          ]
        }
      });

      const reservedItemIds = reservedItems.map(r => r.item_id);
      if (reservedItemIds.length > 0) {
        filters.id = { [Op.notIn]: reservedItemIds };
      }
    }

    // Opciones de ordenamiento
    let order = [["created_at", "DESC"]]; // Por defecto, los más recientes primero

    if (sort === "price_asc") {
      order = [["price_per_day", "ASC"]];
    } else if (sort === "price_desc") {
      order = [["price_per_day", "DESC"]];
    }

    // Consultar en la base de datos con los filtros aplicados
    const items = await Item.findAll({ where: filters, order });

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

//Subir fotos de los items
exports.uploadItemImages = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Archivos subidos:", req.files);

    // Verificar que el archivo se ha subido correctamente
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido imágenes" });
    }

    // Buscar el producto
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Guardar las rutas de las imágenes en la base de datos
    const imageRecords = await Promise.all(
      req.files.map(async (file) => {
        return await ProductImage.create({
          product_id: id,
          image_url: `/uploads/${file.filename}`
        });
      })
    );

    res.status(201).json({ message: "Imágenes subidas correctamente", images: imageRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir las imágenes" });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { image_id } = req.params;

    // Buscar la imagen en la base de datos
    const image = await ProductImage.findByPk(image_id);
    if (!image) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }
    console.log("Hola");

    // Obtener la ruta del archivo
    const imagePath = path.join(__dirname, "../../uploads", path.basename(image.image_url));
    console.log(imagePath)
    // Eliminar la imagen de la base de datos
    await image.destroy();

    // Verificar si el archivo existe antes de eliminarlo
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Eliminar el archivo
    }

    res.status(200).json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};