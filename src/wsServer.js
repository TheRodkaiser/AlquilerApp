const { createServer } = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

const server = createServer();
const io = new Server(server, { cors: { origin: "*" } });

// Mapeo de usuarios autenticados { socket.id: user_id }
const users = {};

io.use((socket, next) => {
  try {
    console.log(socket.handshake.auth.token);
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("❌ Conexión rechazada: No hay token");
      return next(new Error("Token requerido"));
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user_id = decoded.id; // Extraer el usuario autenticado
    users[socket.id] = decoded.id;
    console.log(`🔐 Usuario autenticado: ${decoded.id}`);
    next();
  } catch (err) {
    console.log("❌ Error de autenticación:", err.message);
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  // Unirse a un chat
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`📌 Usuario ${socket.user_id} se unió al chat ${chatId}`);
  });

  // Manejo de mensajes
  socket.on("message", async (data) => {
    console.log("📩 Nuevo mensaje recibido:", data);

    // Guardar mensaje con el usuario autenticado
    const message = await Message.create({
      chat_id: data.chat_id,
      sender_id: socket.user_id, // Se obtiene del token
      content: data.content
    });

    // Enviar mensaje a todos los usuarios en la sala del chat
    io.to(data.chat_id).emit("message", message);
  });

  // Desconexión
  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
    delete users[socket.id]; // Eliminar usuario autenticado
  });
});

const PORT = process.env.WS_PORT || 6001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket corriendo en http://localhost:${PORT}`);
});
