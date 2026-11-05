import { useMemo, useState } from "react";
import "../styles/ExploreEvents.css";

const categorias = [
  "Todas",
  "MÚSICA",
  "TEATRO",
  "DANÇA",
  "ARTES VISUAIS",
  "LITERATURA",
  "CINEMA",
  "CULTURA POPULAR",
  "OUTROS",
];

function lerEventosDoCatalogo() {
  try {
    const salvos = localStorage.getItem("artismap_eventos");
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

function normalizarEvento(evento) {
  return {
    ...evento,
    id: evento.id ?? evento._id ?? String(evento.titulo || evento.title || "evento") + "-" + String(evento.data || evento.date || ""),
    title: evento.title || evento.titulo || "Evento cultural",
    category: evento.category || evento.categoria || "OUTROS",
    date: evento.date || evento.data || "",
    time: evento.time || evento.horario || "",
    location: evento.location || evento.local || "",
    address: evento.address || evento.endereco || "",
    city: evento.city || evento.cidade || "",
    description: evento.description || evento.descricao || "",
    status: evento.status || "Publicado",
  };
}

function formatarData(data) {
  if (!data) return "Data a confirmar";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]))
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
}

function ExploreEvents({
  events = [],
  onOpenMap,
  onOpenAgenda,
  onOpenProfile,
  fotoPerfil,
}) {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [eventosDoCatalogo] = useState(lerEventosDoCatalogo);

  const eventos = useMemo(() => {
    const todos = [...events, ...eventosDoCatalogo]
      .filter((evento) => {
        const status = String(evento.status || "").toLowerCase();
        return status !== "cancelado" &&
          status !== "inativo" &&
          status !== "pendente";
      })
      .map(normalizarEvento);

    const unicos = new Map();
    todos.forEach((evento) => {
      const chave = [
        evento.title.trim().toLowerCase(),
        evento.date,
        evento.location.trim().toLowerCase(),
      ].join("|");
      if (!unicos.has(chave)) unicos.set(chave, evento);
    });

    return [...unicos.values()].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [events, eventosDoCatalogo]);

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return eventos.filter((evento) => {
      const combinaCategoria =
        categoriaSelecionada === "Todas" ||
        evento.category.toUpperCase() === categoriaSelecionada;

      const texto = [
        evento.title,
        evento.category,
        evento.location,
        evento.address,
        evento.city,
        evento.description,
      ].join(" ").toLowerCase();

      return combinaCategoria && (!termo || texto.includes(termo));
    });
  }, [eventos, busca, categoriaSelecionada]);

  return (
    <main className="explore-page">
      <header className="explore-header">
        <div className="explore-header-top">
          <div>
            <span className="explore-eyebrow">ARTISMAP • CULTURA AO SEU REDOR</span>
            <h1>Explore eventos</h1>
            <p>Descubra o que está acontecendo na sua cidade.</p>
          </div>
          <button
            type="button"
            className="explore-profile-button"
            onClick={onOpenProfile}
            aria-label="Abrir perfil"
          >
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto de perfil" />
            ) : (
              "👤"
            )}
          </button>
        </div>

        <label className="explore-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar evento, categoria ou local..."
            aria-label="Buscar eventos"
          />
        </label>

        <div className="explore-filters" aria-label="Filtrar por categoria">
          {categorias.map((categoria) => (
            <button
              type="button"
              key={categoria}
              className={categoriaSelecionada === categoria ? "selected" : ""}
              onClick={() => setCategoriaSelecionada(categoria)}
            >
              {categoria === "Todas" ? "Todos" : categoria}
            </button>
          ))}
        </div>
      </header>

      <section className="explore-content">
        <div className="explore-list-heading">
          <div>
            <span>AGENDA CULTURAL</span>
            <h2>Eventos disponíveis</h2>
          </div>
          <strong>{eventosFiltrados.length} {eventosFiltrados.length === 1 ? "evento" : "eventos"}</strong>
        </div>

        {eventosFiltrados.length === 0 ? (
          <div className="explore-empty">
            <span>✦</span>
            <h3>Nenhum evento encontrado</h3>
            <p>Tente mudar a pesquisa ou selecionar outra categoria.</p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCategoriaSelecionada("Todas");
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="explore-event-list">
            {eventosFiltrados.map((evento) => (
              <article className="explore-event-card" key={evento.id}>
                {evento.imagem && (
                  <img
                    className="explore-event-image"
                    src={evento.imagem}
                    alt={evento.title}
                  />
                )}
                <div className="explore-event-body">
                  <div className="explore-event-top">
                    <span className="explore-category">{evento.category}</span>
                    <span className="explore-available">Disponível</span>
                  </div>

                  <h3>{evento.title}</h3>
                  {evento.description && <p className="explore-description">{evento.description}</p>}

                  <div className="explore-event-info">
                    <p><span>▦</span><strong>Data:</strong> {formatarData(evento.date)}</p>
                    {evento.time && <p><span>◷</span><strong>Horário:</strong> {evento.time}</p>}
                    <p>
                      <span>⌖</span>
                      <strong>Local:</strong>
                      {[evento.location, evento.address, evento.city].filter(Boolean).join(" • ") || "Local a confirmar"}
                    </p>
                    {evento.preco && <p><span>R$</span><strong>Entrada:</strong> {evento.preco}</p>}
                  </div>

                  {evento.link && (
                    <a
                      className="explore-event-link"
                      href={evento.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Mais informações ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <nav className="bottom-navigation explore-navigation">
        <button type="button" className="active" aria-current="page">
          <span>⌂</span>
          <small>Explorar</small>
        </button>
        <button type="button" onClick={onOpenMap}>
          <span>⌖</span>
          <small>Mapa</small>
        </button>
        <button type="button" onClick={onOpenAgenda}>
          <span>▦</span>
          <small>Agenda</small>
        </button>
      </nav>
    </main>
  );
}

export default ExploreEvents;
