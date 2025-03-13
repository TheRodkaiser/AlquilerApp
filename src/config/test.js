const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("alquiler", "postgres", "password", {
  host: "localhost",
  port: 5433,
  dialect: "postgres",
  logging: console.log, // Para ver logs de conexión
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión exitosa a PostgreSQL");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
