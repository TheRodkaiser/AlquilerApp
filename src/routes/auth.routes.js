const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { check } = require("express-validator");

const router = express.Router();


// Validación con express-validator
router.post(
    "/register",
    [
      check("username").not().isEmpty().withMessage("El username es obligatorio"),
      check("email").isEmail().withMessage("Debe ser un email válido"),
      check("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    ],
    register
  );
  
router.post("/login",
    [
        check("username").not().isEmpty().withMessage("Introduce el nombre de usuario"),
        check("password").not().isEmpty().withMessage("Intrdouce la contraseña"),
    ], 
    login);

module.exports = router;
