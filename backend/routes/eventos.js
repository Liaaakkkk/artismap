
const express = require("express");
const mongoose = require("mongoose");
const Evento = require("../models/Evento");

const router = express.Router();

// LISTAR EVENTOS
router.get("/", async (req, res) => {
  try {
    const eventos = await Evento.find().sort({
      createdAt: -1,
    });

    res.json(eventos);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao buscar eventos.",
    });
  }
});

// BUSCAR UM EVENTO
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({
        mensagem: "Evento não encontrado.",
      });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao buscar evento.",
    });
  }
});

// CADASTRAR EVENTO
router.post("/", async (req, res) => {
  try {
    
    console.log("DADOS RECEBIDOS:", req.body);
    console.log("LATITUDE:", req.body.latitude);
    console.log("LONGITUDE:", req.body.longitude);

    const {
      titulo,
      categoria,
      data,
      local,
    } = req.body;

    if (
      !titulo?.trim() ||
      !categoria ||
      !data ||
      !local?.trim()
    ) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const novoEvento = await Evento.create({
      ...req.body,
      titulo: titulo.trim(),
      local: local.trim(),
    });

    res.status(201).json(novoEvento);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: "Erro ao cadastrar evento.",
    });
  }
});

// EDITAR EVENTO
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const eventoAtualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!eventoAtualizado) {
      return res.status(404).json({
        mensagem: "Evento não encontrado.",
      });
    }

    res.json(eventoAtualizado);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: "Erro ao atualizar evento.",
    });
  }
});

// EXCLUIR EVENTO
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const eventoRemovido = await Evento.findByIdAndDelete(
      req.params.id
    );

    if (!eventoRemovido) {
      return res.status(404).json({
        mensagem: "Evento não encontrado.",
      });
    }

    res.json({
      mensagem: "Evento excluído com sucesso.",
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao excluir evento.",
    });
  }
});

module.exports = router;
