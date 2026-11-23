
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDatabase = require("./database/db");
const authRoutes = require("./routes/auth");
const eventosRoutes = require("./routes/eventos");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

// ROTAS
app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventosRoutes);

app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend do ArtisMap funcionando!",
  });
});

// INICIAR APÓS CONECTAR AO BANCO
const PORT = 3001;

async function iniciarServidor() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `Servidor rodando em http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Não foi possível iniciar o servidor.");
    process.exit(1);
  }
}

iniciarServidor();
