const express = require("express");
const router = express.Router();
const { createChat, getChats, getMessages, sendMessage } = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Crear un nuevo chat
router.post("/chats", createChat);

// Obtener los chats de un usuario
router.get("/chats/", authMiddleware, getChats);

// Obtener los mensajes de un chat
router.get("/chats/:chat_id/messages", getMessages);

// Enviar un mensaje
router.post("/chats/messages", sendMessage);

module.exports = router;
