const Usuario = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  // Validar los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { username, email, password, phone, profile_picture, location} = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ where: { email } });
    if (usuario) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    usuario = await Usuario.findOne({ where: { username } });
    if (usuario) {
      return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
    }
    usuario = await Usuario.findOne({ where: { phone } });
    if (usuario) {
      return res.status(400).json({ error: "El teléfono ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    created_at = updated_at = Date.now();

    // Crear usuario
    usuario = await Usuario.create({ username, email, password_hash: hashedPassword, phone, profile_picture, location, created_at, updated_at});

    // Crear token JWT
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Responder con el usuario y el token
    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const usuario = await Usuario.findOne({ where: { username } });

  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const id = usuario.id;
  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, "userId":id});
};
