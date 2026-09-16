import { useEffect, useState } from "react";
import {
  categoriasEventos,
  eventosIniciais,
} from "../data/events";
import "../styles/CatalogoEventos.css";

const STORAGE_KEY = "artismap_eventos";

function obterEventosSalvos() {
  const eventosSalvos = localStorage.getItem(STORAGE_KEY);

  if (!eventosSalvos) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(eventosIniciais)
    );

    return eventosIniciais;
  }

  try {
    return JSON.parse(eventosSalvos);
  } catch {
    return eventosIniciais;
  }
}

function formatarData(data) {
  if (!data) {
    return "Data não informada";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}
function obterStatusEvento(evento) {
  if (evento.status === "inativo") {
    return "inativo";
  }

  if (!evento.data) {
    return "agendado";
  }

  const [ano, mes, dia] = evento.data
    .split("-")
    .map(Number);

  const [hora, minuto] = (evento.horario || "23:59")
    .split(":")
    .map(Number);

  const dataEvento = new Date(
    ano,
    mes - 1,
    dia,
    hora || 0,
    minuto || 0
  );

  const agora = new Date();

  if (dataEvento < agora) {
    return "encerrado";
  }

  return "agendado";
}
function CatalogoEventos({ onVoltar }) {
  const [eventos, setEventos] = useState(obterEventosSalvos);
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [eventoEditando, setEventoEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    categoria: "Música",
    data: "",
    horario: "",
    local: "",
    endereco: "",
    cidade: "",
    estado: "",
    preco: "",
    imagem: "",
    link: "",
    organizador: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
  }, [eventos]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  function limparFormulario() {
    setFormulario({
      titulo: "",
      descricao: "",
      categoria: "Música",
      data: "",
      horario: "",
      local: "",
      endereco: "",
      cidade: "",
      estado: "",
      preco: "",
      imagem: "",
      link: "",
      organizador: "",
    });

    setEventoEditando(null);
  }

  function abrirNovoEvento() {
    limparFormulario();
    setMostrarFormulario(true);
  }

  function editarEvento(evento) {
    setFormulario({
      titulo: evento.titulo || "",
      descricao: evento.descricao || "",
      categoria: evento.categoria || "Música",
      data: evento.data || "",
      horario: evento.horario || "",
      local: evento.local || "",
      endereco: evento.endereco || "",
      cidade: evento.cidade || "",
      estado: evento.estado || "",
      preco: evento.preco || "",
      imagem: evento.imagem || "",
      link: evento.link || "",
      organizador: evento.organizador || "",
    });

    setEventoEditando(evento.id);
    setMostrarFormulario(true);
  }

  function salvarEvento(event) {
    event.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.categoria ||
      !formulario.data ||
      !formulario.local.trim()
    ) {
      alert(
        "Preencha pelo menos o título, a categoria, a data e o local."
      );

      return;
    }

    if (eventoEditando) {
      setEventos((eventosAnteriores) =>
        eventosAnteriores.map((evento) =>
          evento.id === eventoEditando
            ? {
                ...evento,
                ...formulario,
              }
            : evento
        )
      );
    } else {
      const novoEvento = {
        id: Date.now(),
        ...formulario,
        status: "agendado",
      };

      setEventos((eventosAnteriores) => [
        ...eventosAnteriores,
        novoEvento,
      ]);
    }

    limparFormulario();
    setMostrarFormulario(false);
  }

  function inativarEvento(id) {
    const confirmar = window.confirm(
      "Deseja inativar este evento?"
    );

    if (!confirmar) {
      return;
    }

    setEventos((eventosAnteriores) =>
      eventosAnteriores.map((evento) =>
        evento.id === id
          ? {
              ...evento,
              status: "inativo",
            }
          : evento
      )
    );
  }

  function reativarEvento(id) {
    setEventos((eventosAnteriores) =>
      eventosAnteriores.map((evento) =>
        evento.id === id
          ? {
              ...evento,
              status: "agendado",
            }
          : evento
      )
    );
  }

  const eventosFiltrados = eventos.filter((evento) => {
    const correspondeCategoria =
      categoriaSelecionada === "Todas" ||
      evento.categoria === categoriaSelecionada;

    return correspondeCategoria;
  });

  return (
    <main className="catalogo-container">
        <button
  className="botao-secundario"
  onClick={onVoltar}
>
  ← Voltar para Agenda
</button>
      <section className="catalogo-cabecalho">
        <div>
          <p className="catalogo-label">ARTISMAP</p>

          <h1>Catálogo de eventos</h1>

          <p>
            Encontre eventos culturais e descubra novas
            experiências.
          </p>
        </div>

        <button
          className="botao-principal"
          onClick={abrirNovoEvento}
        >
          + Novo evento
        </button>
      </section>

      <section className="filtros-categorias">
        <button
          className={
            categoriaSelecionada === "Todas"
              ? "categoria-ativa"
              : ""
          }
          onClick={() => setCategoriaSelecionada("Todas")}
        >
          Todas
        </button>

        {categoriasEventos.map((categoria) => (
          <button
            key={categoria}
            className={
              categoriaSelecionada === categoria
                ? "categoria-ativa"
                : ""
            }
            onClick={() =>
              setCategoriaSelecionada(categoria)
            }
          >
            {categoria}
          </button>
        ))}
      </section>

      {mostrarFormulario && (
        <section className="formulario-evento">
          <div className="formulario-cabecalho">
            <h2>
              {eventoEditando
                ? "Editar evento"
                : "Cadastrar evento"}
            </h2>

            <button
              className="botao-fechar"
              onClick={() => {
                limparFormulario();
                setMostrarFormulario(false);
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={salvarEvento}>
            <label>
              Título do evento
              <input
                type="text"
                name="titulo"
                value={formulario.titulo}
                onChange={alterarCampo}
                placeholder="Digite o título"
              />
            </label>

            <label>
              Descrição
              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Descreva o evento"
              />
            </label>

            <label>
              Categoria
              <select
                name="categoria"
                value={formulario.categoria}
                onChange={alterarCampo}
              >
                {categoriasEventos.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <div className="formulario-duas-colunas">
              <label>
                Data
                <input
                  type="date"
                  name="data"
                  value={formulario.data}
                  onChange={alterarCampo}
                />
              </label>

              <label>
                Horário
                <input
                  type="time"
                  name="horario"
                  value={formulario.horario}
                  onChange={alterarCampo}
                />
              </label>
            </div>

            <label>
              Local
              <input
                type="text"
                name="local"
                value={formulario.local}
                onChange={alterarCampo}
                placeholder="Nome do local"
              />
            </label>

            <label>
              Endereço
              <input
                type="text"
                name="endereco"
                value={formulario.endereco}
                onChange={alterarCampo}
                placeholder="Endereço completo"
              />
            </label>

            <div className="formulario-duas-colunas">
              <label>
                Cidade
                <input
                  type="text"
                  name="cidade"
                  value={formulario.cidade}
                  onChange={alterarCampo}
                  placeholder="Cidade"
                />
              </label>

              <label>
                Estado
                <input
                  type="text"
                  name="estado"
                  value={formulario.estado}
                  onChange={alterarCampo}
                  placeholder="UF"
                  maxLength="2"
                />
              </label>
            </div>

            <label>
              Preço
              <input
                type="text"
                name="preco"
                value={formulario.preco}
                onChange={alterarCampo}
                placeholder="Ex.: Gratuito ou R$ 20,00"
              />
            </label>

            <label>
              Link do evento
              <input
                type="url"
                name="link"
                value={formulario.link}
                onChange={alterarCampo}
                placeholder="https://..."
              />
            </label>

            <label>
              Link da imagem
              <input
                type="url"
                name="imagem"
                value={formulario.imagem}
                onChange={alterarCampo}
                placeholder="https://..."
              />
            </label>

            <label>
              Organizador
              <input
                type="text"
                name="organizador"
                value={formulario.organizador}
                onChange={alterarCampo}
                placeholder="Nome do organizador"
              />
            </label>

            <div className="formulario-acoes">
              <button
                type="button"
                className="botao-secundario"
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="botao-principal"
              >
                Salvar evento
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="lista-eventos">
        <div className="lista-cabecalho">
          <h2>Eventos disponíveis</h2>

          <span>
            {eventosFiltrados.length} evento(s)
          </span>
        </div>

        {eventosFiltrados.length === 0 ? (
          <p className="mensagem-vazia">
            Nenhum evento encontrado nessa categoria.
          </p>
        ) : (
          eventosFiltrados.map((evento) => (
            <article
              className={
                evento.status === "inativo"
                  ? "evento-card evento-inativo"
                  : "evento-card"
              }
              key={evento.id}
            >
              <div className="evento-card-conteudo">
                <span className="evento-categoria">
                  {evento.categoria}
                </span>
<span
  className={`evento-status status-${obterStatusEvento(
    evento
  )}`}
>
  {obterStatusEvento(evento) === "encerrado"
    ? "Encerrado"
    : obterStatusEvento(evento) === "inativo"
    ? "Inativo"
    : "Agendado"}
</span>
                <h3>{evento.titulo}</h3>

                <p>{evento.descricao}</p>

                <div className="evento-informacoes">
                  <span>
                    📅 {formatarData(evento.data)}
                  </span>

                  <span>🕒 {evento.horario}</span>

                  <span>📍 {evento.local}</span>
                </div>

                <p className="evento-localizacao">
                  {evento.cidade} - {evento.estado}
                </p>

                <p className="evento-preco">
                  {evento.preco || "Preço não informado"}
                </p>

                {evento.status === "inativo" && (
                  <strong>Evento inativo</strong>
                )}
              </div>

              <div className="evento-acoes">
                <button
                  className="botao-secundario"
                  onClick={() => editarEvento(evento)}
                >
                  Editar
                </button>

                {obterStatusEvento(evento) === "inativo" ? (
                  <button
                    className="botao-secundario"
                    onClick={() => reativarEvento(evento.id)}
                  >
                    Reativar
                  </button>
                ) : (
                  <button
                    className="botao-perigo"
                    onClick={() => inativarEvento(evento.id)}
                  >
                    Inativar
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default CatalogoEventos;