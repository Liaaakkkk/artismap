require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDatabase = require("./database/db");
const authRoutes = require("./routes/auth");

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Banco de dados
|--------------------------------------------------------------------------
*/

connectDatabase();

/*
|--------------------------------------------------------------------------
| Rotas
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Rota inicial
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend do ArtisMap funcionando!",
  });
});

/*
|--------------------------------------------------------------------------
| Servidor
|--------------------------------------------------------------------------
*/

const PORT = 3001;

app.listen(PORT, () => {
  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});