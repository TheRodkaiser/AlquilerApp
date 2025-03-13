const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/users");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const Item = require("../models/Item");

// Crear un nuevo chat (si no existe ya)
exports.createChat = async (req, res) => {
  try {
    const { seller_id, buyer_id, product_id } = req.body;

    // Verificar si ya existe un chat entre estos usuarios para este producto
    let chat = await Chat.findOne({
      where: { seller_id, buyer_id, product_id }
    });

    if (!chat) {
      chat = await Chat.create({ seller_id, buyer_id, product_id });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error al crear el chat:", error);
    res.status(500).json({ error: "Error al crear el chat" });
  }
};

// Obtener los chats de un usuario con nombres de vendedor y comprador
exports.getChats = async (req, res) => {
  try {
    // Verificar que el usuario está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    console.log("Usuario identificado:", req.user.id);

    // Obtener los chats en los que el usuario participa
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ seller_id: req.user.id }, { buyer_id: req.user.id }]
      },
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username"] // Obtener solo ID y nombre del vendedor
        },
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username"] // Obtener solo ID y nombre del comprador
        },
        {
          model: Message,
          limit: 1,
          order: [["sent_at", "DESC"]] // Último mensaje enviado en el chat
        },
        {
          model: Item,
          as: "item",
          attributes: ["id", "title"]
        }
      ]
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
};

// Obtener los mensajes de un chat
exports.getMessages = async (req, res) => {
  try {
    const { chat_id } = req.params;

    const messages = await Message.findAll({
      where: { chat_id },
      order: [["sent_at", "ASC"]]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
};

const containsRestrictedContent = (text) => {
  // Patrones de números de teléfono
  const phonePatterns = [
    /[\d]{9}/, // 123456789
    /[\d]{3}[\s.-][\d]{3}[\s.-][\d]{3}/, // 123-456-789 or 123.456.789 or 123 456 789
    /[\d]{3}[\s.-][\d]{2}[\s.-][\d]{2}[\s.-][\d]{2}/, // 123-45-67-89
    /\+[\d]{2,3}[\s.-]?[\d]{9}/, // +34123456789 or +34 123456789
    /\([\d]{2,3}\)[\s.-]?[\d]{9}/, // (34)123456789 or (34) 123456789
    /^[\d]{3}$/, // Just 3 digits
    /^[\d]{4}$/, // Just 4 digits
    /^[\d]{5}$/, // Just 5 digits
  ];

  // Patrones de redes sociales
  const socialMediaPatterns = [
    /facebook|fb/i,
    /instagram|insta|ig/i,
    /twitter|tw|tweet/i,
    /telegram/i,
    /whatsapp|wsp|wasap/i,
    /tiktok|tk/i,
    /linkedin/i,
    /snapchat|snap/i,
    /@[\w.]+/i, // Detecta mentions estilo @usuario
    /[a-zA-Z]+\.com/i, // Detecta dominios .com
    /t\.me/i, // Enlaces de Telegram
    /wa\.me/i, // Enlaces de WhatsApp
  ];

  // Mapa de palabras numéricas a dígitos
  const numberWords = {
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
    'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
    'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
    'quince': '15', 'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18',
    'diecinueve': '19', 'veinte': '20', 'treinta': '30', 'cuarenta': '40',
    'cincuenta': '50', 'sesenta': '60', 'setenta': '70', 'ochenta': '80',
    'noventa': '90', 'cien': '100', 'cientos': '100', 'doscientos': '200',
    'trescientos': '300', 'cuatrocientos': '400', 'quinientos': '500',
    'seiscientos': '600', 'setecientos': '700', 'ochocientos': '800',
    'novecientos': '900', 'mil': '1000'
  };

  // Normalizar el texto
  let normalizedText = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Comprobar patrones de teléfono
  if (phonePatterns.some(pattern => pattern.test(normalizedText))) {
    return {
      isRestricted: true,
      reason: "números de teléfono"
    };
  }

  // Comprobar patrones de redes sociales
  if (socialMediaPatterns.some(pattern => pattern.test(normalizedText))) {
    return {
      isRestricted: true,
      reason: "referencias a redes sociales"
    };
  }

  // Convertir palabras numéricas a dígitos y verificar si forman un número de teléfono
  let numericText = normalizedText;
  Object.entries(numberWords).forEach(([word, digit]) => {
    numericText = numericText.replace(new RegExp(word, 'g'), digit);
  });

  // Eliminar espacios y caracteres no numéricos para la comprobación final
  let cleanNumericText = numericText.replace(/[^0-9]/g, '');
  if (cleanNumericText.length >= 9) {
    return {
      isRestricted: true,
      reason: "números de teléfono escritos en texto"
    };
  }

  return {
    isRestricted: false,
    reason: null
  };
};

// Enviar un mensaje en un chat
exports.sendMessage = async (req, res) => {
  try {
    const { chat_id, sender_id, content } = req.body;
    const authenticatedUserId = req.user.id; // Asumiendo que tienes middleware de autenticación

    // Verificar que el sender_id coincide con el usuario autenticado
    if (parseInt(sender_id) !== authenticatedUserId) {
      return res.status(403).json({ 
        error: "No tienes permiso para enviar mensajes en nombre de otro usuario" 
      });
    }

    // Validar que se proporcionaron todos los campos necesarios
    if (!chat_id || !sender_id || !content) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos (chat_id, sender_id, content)" 
      });
    }

    // Verificar contenido restringido
    const contentCheck = containsRestrictedContent(content);
    if (contentCheck.isRestricted) {
      return res.status(400).json({
        error: `No está permitido compartir ${contentCheck.reason} por seguridad. Por favor, utiliza el sistema de mensajes para comunicarte.`
      });
    }

    // Crear el mensaje
    const message = await Message.create({
      chat_id: parseInt(chat_id),
      sender_id: parseInt(sender_id),
      content
    });

    // Emitir el mensaje en tiempo real si estás usando Socket.IO
    const io = require("../server").io;
    io.to(`chat_${chat_id}`).emit("receiveMessage", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
};