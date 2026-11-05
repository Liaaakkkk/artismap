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
        fotoPerfil: novoUsuario.fotoPerfil || "",
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
        fotoPerfil: usuario.fotoPerfil || "",
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login.",
    });
  }
});


// Atualiza a foto de perfil de uma conta.
router.put("/:id/foto", async (req, res) => {
  try {
    const { fotoPerfil } = req.body;

    if (typeof fotoPerfil !== "string") {
      return res.status(400).json({
        mensagem: "Envie uma imagem válida.",
      });
    }

    const formatoPermitido =
      /^data:image\/(jpeg|png|webp);base64,/i;

    if (!formatoPermitido.test(fotoPerfil)) {
      return res.status(400).json({
        mensagem: "Use uma imagem JPG, PNG ou WEBP.",
      });
    }

    const base64 = fotoPerfil.split(",")[1] || "";
    const tamanhoEmBytes = Buffer.from(base64, "base64").length;

    if (!tamanhoEmBytes || tamanhoEmBytes > 2 * 1024 * 1024) {
      return res.status(413).json({
        mensagem: "A imagem deve ter no máximo 2 MB.",
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { fotoPerfil },
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).json({
        mensagem: "Conta não encontrada.",
      });
    }

    return res.json({
      mensagem: "Foto de perfil atualizada.",
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        fotoPerfil: usuario.fotoPerfil || "",
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);

    return res.status(500).json({
      mensagem: "Não foi possível atualizar a foto.",
    });
  }
});

module.exports = router;