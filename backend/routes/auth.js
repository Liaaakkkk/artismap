const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CADASTRO
|--------------------------------------------------------------------------
*/

router.post("/cadastro", async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      tipo = "usuario",
    } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    // Verifica tipo
    if (!["usuario", "produtor"].includes(tipo)) {
      return res.status(400).json({
        mensagem: "Tipo de conta inválido.",
      });
    }

    // Verifica se o e-mail já existe
    const usuarioExistente = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria usuário
    const novoUsuario = await User.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaCriptografada,
      tipo,
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",

      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
      },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      senha,
      tipo = "usuario",
    } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    // Verifica tipo
    if (!["usuario", "produtor"].includes(tipo)) {
      return res.status(400).json({
        mensagem: "Tipo de conta inválido.",
      });
    }

    // Procura usuário
    const usuario = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!usuario) {
      return res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    // Compara senha
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    // IMPORTANTE:
    // O tipo escolhido na tela precisa ser o mesmo
    // tipo cadastrado no banco.
    if (usuario.tipo !== tipo) {
      if (tipo === "produtor") {
        return res.status(403).json({
          mensagem:
            "Esta conta não possui acesso à área do produtor.",
        });
      }

      return res.status(403).json({
        mensagem:
          "Esta conta é de produtor. Selecione a opção Produtor.",
      });
    }

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",

      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login.",
    });
  }
});

module.exports = router;