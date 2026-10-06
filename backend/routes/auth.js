const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();

// CADASTRO
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se os campos foram enviados
    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    // Verifica se o e-mail já existe
    const usuarioExistente = await User.findOne({
      email: email.toLowerCase(),
    });

    if (usuarioExistente) {
      return res.status(400).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria o usuário no MongoDB
    const novoUsuario = await User.create({
      nome,
      email: email.toLowerCase(),
      senha: senhaHash,
    });

    // Não enviamos a senha de volta
    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
    });
  }
});

module.exports = router;