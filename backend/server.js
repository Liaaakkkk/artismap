require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDatabase = require("./database/db");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Conecta ao MongoDB
connectDatabase();

// Rotas de autenticação
app.use("/", authRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend do ArtisMap funcionando!",
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});