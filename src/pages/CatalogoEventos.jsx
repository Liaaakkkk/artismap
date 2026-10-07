import { useEffect, useState } from "react";
import {
  categoriasEventos,
  eventosIniciais,
} from "../data/events";

import "../styles/CatalogoEventos.css";

const STORAGE_KEY = "artismap_eventos";

function obterEventosSalvos() {
  const eventosSalvos =
    localStorage.getItem(STORAGE_KEY);

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
    return "";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterStatusEvento(evento) {
  if (evento.status === "inativo") {
    return "inativo";
  }

  if (!evento.data) {
    return "agendado";
  }

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  const dataEvento = new Date(
    `${evento.data}T00:00:00`
  );

  if (dataEvento < hoje) {
    return "encerrado";
  }

  return "agendado";
}

function CatalogoEventos({
  usuario,
  onVoltar,
}) {
  const isProdutor =
    usuario?.tipo === "produtor";

  const [eventos, setEventos] =
    useState(obterEventosSalvos);

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState("Todas");

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    eventoEditando,
    setEventoEditando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    data: "",
    horario: "",
    local: "",
    endereco: "",
    cidade: "Fortaleza",
    estado: "CE",
    preco: "",
    imagem: "",
    link: "",
    organizador: "",
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(eventos)
    );
  }, [eventos]);

  function abrirNovoEvento() {
    if (!isProdutor) {
      return;
    }

    setEventoEditando(null);

    setFormulario({
      titulo: "",
      descricao: "",
      categoria: "",
      data: "",
      horario: "",
      local: "",
      endereco: "",
      cidade: "Fortaleza",
      estado: "CE",
      preco: "",
      imagem: "",
      link: "",
      organizador: "",
    });

    setMostrarFormulario(true);
  }

  function editarEvento(evento) {
    if (!isProdutor) {
      return;
    }

    setEventoEditando(evento.id);

    setFormulario({
      titulo: evento.titulo || "",
      descricao: evento.descricao || "",
      categoria: evento.categoria || "",
      data: evento.data || "",
      horario: evento.horario || "",
      local: evento.local || "",
      endereco: evento.endereco || "",
      cidade: evento.cidade || "Fortaleza",
      estado: evento.estado || "CE",
      preco: evento.preco || "",
      imagem: evento.imagem || "",
      link: evento.link || "",
      organizador: evento.organizador || "",
    });

    setMostrarFormulario(true);
  }

  function atualizarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function salvarEvento(event) {
    event.preventDefault();

    if (!isProdutor) {
      return;
    }

    if (
      !formulario.titulo ||
      !formulario.categoria ||
      !formulario.data ||
      !formulario.local
    ) {
      alert(
        "Preencha título, categoria, data e local."
      );

      return;
    }

    if (eventoEditando) {
      setEventos((anteriores) =>
        anteriores.map((evento) =>
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
        criadoPor: usuario?.email || "",
        criadoEm:
          new Date().toISOString(),
      };

      setEventos((anteriores) => [
        ...anteriores,
        novoEvento,
      ]);
    }

    setMostrarFormulario(false);
    setEventoEditando(null);
  }

  function inativarEvento(id) {
    if (!isProdutor) {
      return;
    }

    setEventos((anteriores) =>
      anteriores.map((evento) =>
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
    if (!isProdutor) {
      return;
    }

    setEventos((anteriores) =>
      anteriores.map((evento) =>
        evento.id === id
          ? {
              ...evento,
              status: "agendado",
            }
          : evento
      )
    );
  }

  const eventosFiltrados =
    categoriaSelecionada === "Todas"
      ? eventos
      : eventos.filter(
          (evento) =>
            evento.categoria ===
            categoriaSelecionada
        );

  return (
    <main className="catalogo-page">
      <header className="catalogo-header">
        <button
          type="button"
          onClick={onVoltar}
        >
          ← Voltar
        </button>

        <div>
          <h1>Catálogo de eventos</h1>

          <p>
            Encontre eventos culturais
            em Fortaleza.
          </p>
        </div>
      </header>

      <section className="catalogo-content">
        <div className="catalogo-top">
          <select
            value={categoriaSelecionada}
            onChange={(event) =>
              setCategoriaSelecionada(
                event.target.value
              )
            }
          >
            <option value="Todas">
              Todas as categorias
            </option>

            {categoriasEventos.map(
              (categoria) => (
                <option
                  key={categoria}
                  value={categoria}
                >
                  {categoria}
                </option>
              )
            )}
          </select>

          {isProdutor && (
            <button
              type="button"
              onClick={abrirNovoEvento}
              className="novo-evento-button"
            >
              + Novo evento
            </button>
          )}
        </div>

        {!isProdutor && (
          <div className="catalogo-info">
            <p>
              Você está visualizando o
              catálogo de eventos.
            </p>
          </div>
        )}

        {mostrarFormulario &&
          isProdutor && (
            <form
              className="evento-form"
              onSubmit={salvarEvento}
            >
              <h2>
                {eventoEditando
                  ? "Editar evento"
                  : "Novo evento"}
              </h2>

              <label>
                Título
                <input
                  type="text"
                  value={
                    formulario.titulo
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "titulo",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={
                    formulario.descricao
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Categoria
                <select
                  value={
                    formulario.categoria
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "categoria",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  {categoriasEventos.map(
                    (categoria) => (
                      <option
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={formulario.data}
                  onChange={(event) =>
                    atualizarCampo(
                      "data",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Horário
                <input
                  type="time"
                  value={
                    formulario.horario
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "horario",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Local
                <input
                  type="text"
                  value={formulario.local}
                  onChange={(event) =>
                    atualizarCampo(
                      "local",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Endereço
                <input
                  type="text"
                  value={
                    formulario.endereco
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "endereco",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Cidade
                <input
                  type="text"
                  value={formulario.cidade}
                  onChange={(event) =>
                    atualizarCampo(
                      "cidade",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Estado
                <input
                  type="text"
                  value={formulario.estado}
                  onChange={(event) =>
                    atualizarCampo(
                      "estado",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Preço
                <input
                  type="text"
                  placeholder="Gratuito ou R$ 20,00"
                  value={formulario.preco}
                  onChange={(event) =>
                    atualizarCampo(
                      "preco",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Imagem
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={formulario.imagem}
                  onChange={(event) =>
                    atualizarCampo(
                      "imagem",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Link
                <input
                  type="text"
                  placeholder="Link do evento"
                  value={formulario.link}
                  onChange={(event) =>
                    atualizarCampo(
                      "link",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Organizador
                <input
                  type="text"
                  value={
                    formulario.organizador
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "organizador",
                      event.target.value
                    )
                  }
                />
              </label>

              <div className="evento-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(
                      false
                    );
                    setEventoEditando(null);
                  }}
                >
                  Cancelar
                </button>

                <button type="submit">
                  {eventoEditando
                    ? "Salvar alterações"
                    : "Cadastrar evento"}
                </button>
              </div>
            </form>
          )}

        <section className="eventos-lista">
          {eventosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>
                Nenhum evento encontrado.
              </p>
            </div>
          ) : (
            eventosFiltrados.map(
              (evento) => {
                const status =
                  obterStatusEvento(
                    evento
                  );

                return (
                  <article
                    className={`evento-card ${status}`}
                    key={evento.id}
                  >
                    {evento.imagem && (
                      <img
                        src={evento.imagem}
                        alt={evento.titulo}
                        className="evento-imagem"
                      />
                    )}

                    <div className="evento-card-content">
                      <span className="evento-categoria">
                        {evento.categoria}
                      </span>

                      <h2>
                        {evento.titulo}
                      </h2>

                      {evento.descricao && (
                        <p>
                          {evento.descricao}
                        </p>
                      )}

                      <div className="evento-info">
                        <span>
                          📅{" "}
                          {formatarData(
                            evento.data
                          )}
                        </span>

                        {evento.horario && (
                          <span>
                            🕐{" "}
                            {
                              evento.horario
                            }
                          </span>
                        )}

                        <span>
                          📍{" "}
                          {evento.local}
                        </span>

                        {evento.preco && (
                          <span>
                            💰{" "}
                            {evento.preco}
                          </span>
                        )}
                      </div>

                      <div className="evento-status">
                        {status ===
                          "inativo" &&
                          "Evento inativo"}

                        {status ===
                          "agendado" &&
                          "Evento agendado"}

                        {status ===
                          "encerrado" &&
                          "Evento encerrado"}
                      </div>

                      {isProdutor && (
                        <div className="evento-actions">
                          <button
                            type="button"
                            onClick={() =>
                              editarEvento(
                                evento
                              )
                            }
                          >
                            Editar
                          </button>

                          {status ===
                          "inativo" ? (
                            <button
                              type="button"
                              onClick={() =>
                                reativarEvento(
                                  evento.id
                                )
                              }
                            >
                              Reativar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                inativarEvento(
                                  evento.id
                                )
                              }
                            >
                              Inativar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )
          )}
        </section>
      </section>
    </main>
  );
}

export default CatalogoEventos;