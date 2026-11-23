
const mongoose = require("mongoose");

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      default: "",
    },
    categoria: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    horario: {
      type: String,
      default: "",
    },
    local: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      default: null,
    },
    
    longitude: {
      type: Number,
      default: null,
    },

    endereco: {
      type: String,
      default: "",
    },
    cidade: {
      type: String,
      default: "Fortaleza",
    },
    estado: {
      type: String,
      default: "CE",
    },
    preco: {
      type: String,
      default: "",
    },
    imagem: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    organizador: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["agendado", "inativo"],
      default: "agendado",
    },
    criadoPor: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Evento", eventoSchema);
