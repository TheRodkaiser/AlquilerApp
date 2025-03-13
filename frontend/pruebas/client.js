const socket = io("ws://localhost:6001", {
  auth: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzM3NTUyMzY3LCJleHAiOjE3Mzc2Mzg3Njd9._OiX51PDIJK8AvbDYAv2k2_3pEjvR-agoprkodVfyV4" }
});

socket.emit("joinChat", 1); // Unirse al chat con ID 1

socket.emit("message", {
  chat_id: 1,
  content: "Hola, ¿está disponible?"
});
