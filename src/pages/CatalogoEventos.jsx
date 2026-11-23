
import { useEffect, useState } from "react";

import { categoriasEventos } from "../data/events";

import "../styles/CatalogoEventos.css";

const API_URL = "http://localhost:3001/api/eventos";

// =========================================
// PREPARAR EVENTO RECEBIDO DO MONGODB
// =========================================

function prepararEvento(evento) {
  return {
    ...evento,
    id: String(evento._id || evento.id),

    latitude:
      evento.latitude == null
        ? ""
        : String(evento.latitude),

    longitude:
      evento.longitude == null
        ? ""
        : String(evento.longitude),
  };
}

// =========================================
// FORMATAR DATA
// =========================================

function formatarData(data) {
  if (!data) return "";

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// =========================================
// STATUS DO EVENTO
// =========================================

function obterStatusEvento(evento) {
  if (evento.status === "inativo") {
    return "inativo";
  }

  if (!evento.data) {
    return "agendado";
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEvento = new Date(`${evento.data}T00:00:00`);

  if (dataEvento < hoje) {
    return "encerrado";
  }

  return "agendado";
}

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

function CatalogoEventos({
  usuario,
  onVoltar,
  onOpenProfile,
}) {
  const isProdutor = usuario?.tipo === "produtor";

  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [eventoSelecionado, setEventoSelecionado] =
    useState(null);

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [eventoEditando, setEventoEditando] =
    useState(null);

  const formularioInicial = {
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
    latitude: "",
    longitude: "",
  };

  const [formulario, setFormulario] =
    useState(formularioInicial);

  // =========================================
  // CARREGAR EVENTOS DO MONGODB
  // =========================================

  useEffect(() => {
    async function carregarEventos() {
      try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível buscar os eventos."
          );
        }

        const dados = await resposta.json();

        setEventos(dados.map(prepararEvento));
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);

        alert(
          "Não foi possível carregar os eventos. Verifique se o backend está funcionando."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarEventos();
  }, []);

  // =========================================
  // ABRIR FORMULÁRIO DE NOVO EVENTO
  // =========================================

  function abrirNovoEvento() {
    if (!isProdutor) return;

    setEventoEditando(null);

    setFormulario({
      ...formularioInicial,
    });

    setMostrarFormulario(true);
  }

  // =========================================
  // EDITAR EVENTO
  // =========================================

  function editarEvento(evento) {
    if (!isProdutor) return;

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
      latitude: evento.latitude ?? "",
      longitude: evento.longitude ?? "",
    });

    setMostrarFormulario(true);
  }

  // =========================================
  // ATUALIZAR CAMPOS DO FORMULÁRIO
  // =========================================

  function atualizarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // =========================================
  // SALVAR EVENTO NO MONGODB
  // =========================================

  async function salvarEvento(event) {
    event.preventDefault();

    if (!isProdutor) return;

    if (
      !formulario.titulo.trim() ||
      !formulario.categoria ||
      !formulario.data ||
      !formulario.local.trim()
    ) {
      alert("Preencha título, categoria, data e local.");
      return;
    }

    // Verifica se as duas coordenadas foram preenchidas.
    const latitudePreenchida =
      String(formulario.latitude).trim() !== "";

    const longitudePreenchida =
      String(formulario.longitude).trim() !== "";

    if (latitudePreenchida !== longitudePreenchida) {
      alert(
        "Preencha latitude e longitude juntas ou deixe os dois campos vazios."
      );
      return;
    }

    let latitude = null;
    let longitude = null;

    if (latitudePreenchida && longitudePreenchida) {
      latitude = Number(formulario.latitude);
      longitude = Number(formulario.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        alert(
          "Coordenadas inválidas. Confira os valores de latitude e longitude."
        );
        return;
      }
    }

    try {
      const editando = eventoEditando !== null;

      const url = editando
        ? `${API_URL}/${eventoEditando}`
        : API_URL;

      const eventoParaSalvar = {
        ...formulario,
        latitude,
        longitude,
      };

      const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          editando
            ? eventoParaSalvar
            : {
                ...eventoParaSalvar,
                status: "agendado",
                criadoPor: usuario?.email || "",
              }
        ),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Erro ao salvar evento."
        );
      }

      const eventoAtualizado = prepararEvento(dados);

      if (editando) {
        setEventos((anteriores) =>
          anteriores.map((evento) =>
            evento.id === eventoEditando
              ? eventoAtualizado
              : evento
          )
        );

        setEventoSelecionado((anterior) =>
          anterior?.id === eventoEditando
            ? eventoAtualizado
            : anterior
        );

        alert("Evento atualizado com sucesso!");
      } else {
        setEventos((anteriores) => [
          eventoAtualizado,
          ...anteriores,
        ]);

        alert("Evento cadastrado com sucesso!");
      }

      setMostrarFormulario(false);
      setEventoEditando(null);
      setFormulario({ ...formularioInicial });
    } catch (error) {
      console.error("Erro ao salvar evento:", error);

      alert(
        error.message || "Não foi possível salvar o evento."
      );
    }
  }

  // =========================================
  // ALTERAR STATUS DO EVENTO
  // =========================================

  async function alterarStatusEvento(id, status) {
    if (!isProdutor) return;

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ status }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível atualizar o evento."
        );
      }

      const eventoAtualizado = prepararEvento(dados);

      setEventos((anteriores) =>
        anteriores.map((evento) =>
          evento.id === id ? eventoAtualizado : evento
        )
      );

      setEventoSelecionado((anterior) =>
        anterior?.id === id ? eventoAtualizado : anterior
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);

      alert(error.message);
    }
  }

  // =========================================
  // INATIVAR E REATIVAR
  // =========================================

  function inativarEvento(id) {
    alterarStatusEvento(id, "inativo");
  }

  function reativarEvento(id) {
    alterarStatusEvento(id, "agendado");
  }

  // =========================================
  // FILTRAR EVENTOS
  // =========================================

  const eventosFiltrados =
    categoriaSelecionada === "Todas"
      ? eventos
      : eventos.filter(
          (evento) =>
            evento.categoria === categoriaSelecionada
        );

  // =========================================
  // RENDERIZAÇÃO
  // =========================================

  return (
    <main className="catalogo-page">

      {/* CABEÇALHO */}

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
            Encontre eventos culturais em Fortaleza.
          </p>
        </div>

        <button
          type="button"
          className="profile-button catalog-profile-button"
          aria-label="Abrir perfil"
          onClick={onOpenProfile}
        >
          {usuario?.fotoPerfil ? (
            <img
              src={usuario.fotoPerfil}
              alt="Foto de perfil"
            />
          ) : (
            "👤"
          )}
        </button>

      </header>

      {/* CONTEÚDO */}

      <section className="catalogo-content">

        {/* FILTROS E BOTÃO DE CADASTRO */}

        <div className="catalogo-top">

          <select
            value={categoriaSelecionada}
            onChange={(event) =>
              setCategoriaSelecionada(event.target.value)
            }
          >
            <option value="Todas">
              Todas as categorias
            </option>

            {categoriasEventos.map((categoria) => (
              <option
                key={categoria}
                value={categoria}
              >
                {categoria}
              </option>
            ))}

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

        {/* INFORMAÇÃO PARA VISITANTES */}

        {!isProdutor && (
          <div className="catalogo-info">
            <p>
              Você está visualizando o catálogo de eventos.
            </p>
          </div>
        )}

        {/* FORMULÁRIO */}

        {mostrarFormulario && isProdutor && (
          <form
            className="evento-form"
            onSubmit={salvarEvento}
          >

            <h2>
              {eventoEditando !== null
                ? "Editar evento"
                : "Novo evento"}
            </h2>

            <label>
              Título

              <input
                type="text"
                value={formulario.titulo}
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
                value={formulario.descricao}
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
                value={formulario.categoria}
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

                {categoriasEventos.map((categoria) => (
                  <option
                    key={categoria}
                    value={categoria}
                  >
                    {categoria}
                  </option>
                ))}

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
                value={formulario.horario}
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
                value={formulario.endereco}
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
                value={formulario.organizador}
                onChange={(event) =>
                  atualizarCampo(
                    "organizador",
                    event.target.value
                  )
                }
              />
            </label>

            {/* COORDENADAS PARA O MAPA */}

            <div className="coordenadas-section">
              <h3>Localização no mapa</h3>

              <p>
                Informe as coordenadas geográficas do local
                para que o evento apareça no mapa do ArtisMap.
              </p>

              <label>
                Latitude

                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="-3.73186"
                  value={formulario.latitude}
                  onChange={(event) =>
                    atualizarCampo(
                      "latitude",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Longitude

                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="-38.52667"
                  value={formulario.longitude}
                  onChange={(event) =>
                    atualizarCampo(
                      "longitude",
                      event.target.value
                    )
                  }
                />
              </label>

              <small>
                As coordenadas são opcionais, mas necessárias
                para exibir o evento no mapa.
              </small>
            </div>

            {/* BOTÕES DO FORMULÁRIO */}

            <div className="evento-form-actions">

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setEventoEditando(null);
                  setFormulario({ ...formularioInicial });
                }}
              >
                Cancelar
              </button>

              <button type="submit">
                {eventoEditando !== null
                  ? "Salvar alterações"
                  : "Cadastrar evento"}
              </button>

            </div>

          </form>
        )}

        {/* LISTA DE EVENTOS */}

        <section className="eventos-lista">

          {carregando ? (

            <div className="empty-state">
              <p>Carregando eventos...</p>
            </div>

          ) : eventosFiltrados.length === 0 ? (

            <div className="empty-state">
              <p>Nenhum evento encontrado.</p>
            </div>

          ) : (

            eventosFiltrados.map((evento) => {

              const status = obterStatusEvento(evento);

              return (
                <article
                  className={`evento-card ${status} evento-card-clicavel`}
                  key={evento.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setEventoSelecionado(evento)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setEventoSelecionado(evento);
                    }
                  }}
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

                    <h2>{evento.titulo}</h2>

                    {evento.descricao && (
                      <p>{evento.descricao}</p>
                    )}

                    <div className="evento-info">

                      <span>
                        📅 {formatarData(evento.data)}
                      </span>

                      {evento.horario && (
                        <span>
                          🕐 {evento.horario}
                        </span>
                      )}

                      <span>
                        📍 {evento.local}
                      </span>

                      {evento.preco && (
                        <span>
                          💰 {evento.preco}
                        </span>
                      )}

                    </div>

                    <div className="evento-status">

                      {status === "inativo" &&
                        "Evento inativo"}

                      {status === "agendado" &&
                        "Evento agendado"}

                      {status === "encerrado" &&
                        "Evento encerrado"}

                    </div>

                    {/* AÇÕES DO PRODUTOR */}

                    {isProdutor && (
                      <div
                        className="evento-actions"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            editarEvento(evento)
                          }
                        >
                          Editar
                        </button>

                        {status === "inativo" ? (

                          <button
                            type="button"
                            onClick={() =>
                              reativarEvento(evento.id)
                            }
                          >
                            Reativar
                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              inativarEvento(evento.id)
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
            })

          )}

        </section>

      </section>

      {/* MODAL DE DETALHES DO EVENTO */}

      {eventoSelecionado && (

        <div
          className="evento-modal-overlay"
          onClick={() =>
            setEventoSelecionado(null)
          }
        >

          <section
            className="evento-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="evento-modal-titulo"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="evento-modal-fechar"
              aria-label="Fechar detalhes"
              onClick={() =>
                setEventoSelecionado(null)
              }
            >
              ×
            </button>

            {eventoSelecionado.imagem && (
              <img
                src={eventoSelecionado.imagem}
                alt={eventoSelecionado.titulo}
              />
            )}

            <span className="evento-categoria">
              {eventoSelecionado.categoria}
            </span>

            <h2 id="evento-modal-titulo">
              {eventoSelecionado.titulo}
            </h2>

            {eventoSelecionado.descricao && (
              <p>{eventoSelecionado.descricao}</p>
            )}

            <div className="evento-modal-informacoes">

              <span>
                📅 {formatarData(eventoSelecionado.data)}
              </span>

              {eventoSelecionado.horario && (
                <span>
                  🕐 {eventoSelecionado.horario}
                </span>
              )}

              {eventoSelecionado.local && (
                <span>
                  📍 {eventoSelecionado.local}
                </span>
              )}

              {eventoSelecionado.endereco && (
                <span>
                  🧭 {eventoSelecionado.endereco}
                  {eventoSelecionado.cidade
                    ? `, ${eventoSelecionado.cidade}`
                    : ""}
                  {eventoSelecionado.estado
                    ? ` - ${eventoSelecionado.estado}`
                    : ""}
                </span>
              )}

              {eventoSelecionado.preco && (
                <span>
                  💰 {eventoSelecionado.preco}
                </span>
              )}

              {eventoSelecionado.organizador && (
                <span>
                  ✦ Organização: {eventoSelecionado.organizador}
                </span>
              )}

              {eventoSelecionado.link && (
                <a
                  href={eventoSelecionado.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acessar página do evento
                </a>
              )}

            </div>

            <button
              type="button"
              className="evento-modal-botao"
              onClick={() =>
                setEventoSelecionado(null)
              }
            >
              Fechar
            </button>

          </section>

        </div>

      )}

    </main>
  );
}

export default CatalogoEventos;
