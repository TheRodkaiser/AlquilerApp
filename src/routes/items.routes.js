const express = require("express");
const { createItem, updateItem, deleteItem, getItems, getItemById, uploadItemImages, deleteImage} = require("../controllers/items.controller");
const authMiddleware = require("../middlewares/authMiddleware"); // Asegurar autenticación
const { check } = require("express-validator");

const router = express.Router();
const upload = require("../middlewares/upload");

// Ruta para subir un producto
router.post("/", authMiddleware, 
    [
        check("title").not().isEmpty().withMessage("El título es obligatorio"),
        check("description").not().isEmpty().withMessage("La descripción es obligatoria"),
        check("price_per_day").isFloat({ min: 0 }).withMessage("El precio por día debe ser un número positivo"),
        check("deposit").isFloat({ min: 0 }).withMessage("El depósito debe ser un número positivo"),
        check("category_id").isInt().withMessage("La categoría debe ser un número entero"),
        check("condition").not().isEmpty().withMessage("La condición del producto es obligatoria"),
        check("location").not().isEmpty().withMessage("La ubicación es obligatoria"),
        check("status").not().isEmpty().withMessage("El estado del producto es obligatorio"),
      ],
      createItem);


router.put("/:id", authMiddleware,
    [
        check("title").not().isEmpty().withMessage("El título es obligatorio"),
        check("description").not().isEmpty().withMessage("La descripción es obligatoria"),
        check("price_per_day").isFloat({ min: 0 }).withMessage("El precio por día debe ser un número positivo"),
        check("deposit").isFloat({ min: 0 }).withMessage("El depósito debe ser un número positivo"),
        check("category_id").isInt().withMessage("La categoría debe ser un número entero"),
        check("condition").not().isEmpty().withMessage("La condición del producto es obligatoria"),
        check("condition").isIn(['new', 'used', 'refurbished']).withMessage("El producto debe estar 'new', 'used', 'refurbished'."),
        check("location").not().isEmpty().withMessage("La ubicación es obligatoria"),
        check("status").not().isEmpty().withMessage("El estado del producto es obligatorio"),
        check("status").isIn(['available', 'reserved', 'rented']).withMessage("El producto debe estar 'new', 'used', 'refurbished'."),
        ],
        updateItem);

// Ruta para eliminar un producto
router.delete("/:id", authMiddleware, deleteItem);


// Ruta para obtener productos con búsqueda y filtros
router.get("/", getItems);

//Obtener un item por su id
router.get("/items/:id", getItemById);

//Subir imágenes de un producto
router.post("/items/:id/upload-images", upload.array("images", 5), uploadItemImages); // Máximo 5 imágenes

// Ruta para eliminar una imagen por su ID
router.delete("/items/images/:image_id", deleteImage);

module.exports = router;
