require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const setupAssociations = require("./models/associations");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", // Permite cualquier origen (ajústalo según sea necesario)
    }
  });

setupAssociations();
  

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


// Rutas
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/items", require("./routes/items.routes")); 
app.use("/api/rentals", require("./routes/rentals.routes")); 
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
const chatRoutes = require("./routes/chat.routes");
app.use("/api", chatRoutes);
const blockedDatesRoutes = require("./routes/blockedDates.routes");
app.use("/api", blockedDatesRoutes);
const reviewsRoutes = require("./routes/reviews.routes");
app.use("/api", reviewsRoutes);
const favoritesRoutes = require("./routes/favorites.routes");
app.use("/api/favorites", favoritesRoutes);


//Manejar eventos de websockets

// Manejar eventos de WebSockets
// Evento de conexión de WebSocket
io.on("connection", (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  socket.on("message", (data) => {
    console.log(`📩 Mensaje recibido de ${socket.id}:`, data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });

  socket.on("error", (err) => {
    console.error(`⚠️ Error en WebSocket con ${socket.id}:`, err);
  });
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`API y webSocket corriendo en puerto ${PORT}`));
