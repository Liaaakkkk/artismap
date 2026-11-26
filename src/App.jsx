
import BottomNav from "./components/BottomNav";

import { useEffect, useMemo, useState } from "react";

import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import ProducerArea from "./components/ProducerArea";
import CatalogoEventos from "./pages/CatalogoEventos";
import ExploreEvents from "./pages/ExploreEvents";
import UserProfile from "./pages/UserProfile";
import SavedEvents from "./pages/SavedEvents";

import SearchBar from "./components/SearchBar";
import CategoryFilters from "./components/CategoryFilters";
import MapView from "./components/MapView";
import UserLocationButton from "./components/UserLocationButton";

import Login from "./components/Login";
import Cadastro from "./components/Cadastro";

import {
  obterUsuario,
  logoutUsuario,
  atualizarFotoPerfil,
} from "./utils/auth";

import culturalPoints from "./data/culturalPoints";

import "./App.css";

const API_EVENTOS = "http://localhost:3001/api/eventos";

/*
|--------------------------------------------------------------------------
| Eventos iniciais de demonstração
|--------------------------------------------------------------------------
*/

const initialEvents = [
  {
    id: 1,
    title: "Arte Urbana",
    category: "ARTE",
    date: "2026-09-15",
    time: "14:00",
    location: "Beco das Artes",
  },
  {
    id: 2,
    title: "Festival de Música",
    category: "MÚSICA",
    date: "2026-09-18",
    time: "19:00",
    location: "Centro Cultural",
  },
  {
    id: 3,
    title: "Exposição Nordeste",
    category: "EXPOSIÇÃO",
    date: "2026-09-20",
    time: "10:00",
    location: "Museu da Cultura",
  },
  {
    id: 4,
    title: "Sarau Cultural",
    category: "LITERATURA",
    date: "2026-09-25",
    time: "18:30",
    location: "Biblioteca Central",
  },
  {
    id: 5,
    title: "Cinema ao Ar Livre",
    category: "CINEMA",
    date: "2026-09-27",
    time: "20:00",
    location: "Praça Cultural",
  },
];

/*
|--------------------------------------------------------------------------
| Normalização de categorias
|--------------------------------------------------------------------------
*/

function normalizarCategoria(categoria) {
  return String(categoria || "outros")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/*
|--------------------------------------------------------------------------
| Normalização dos eventos vindos do MongoDB
|--------------------------------------------------------------------------
*/

function normalizarEvento(evento) {
  return {
    id: String(evento._id || evento.id),

    title:
      evento.titulo ||
      evento.title ||
      "Evento sem título",

    category:
      evento.categoria ||
      evento.category ||
      "OUTROS",

    date: String(
      evento.data || evento.date || ""
    ).slice(0, 10),

    time:
      evento.horario ||
      evento.time ||
      "",

    location:
      evento.local ||
      evento.location ||
      "",

    address:
      evento.endereco ||
      evento.address ||
      "",

    city:
      evento.cidade ||
      evento.city ||
      "Fortaleza",

    description:
      evento.descricao ||
      evento.description ||
      "",

    status: String(
      evento.status || "agendado"
    ).toLowerCase(),

    preco:
      evento.preco ||
      evento.price ||
      "",

    price:
      evento.preco ||
      evento.price ||
      "Não informado",

    imagem:
      evento.imagem ||
      "",

    link:
      evento.link ||
      "",

    organizador:
      evento.organizador ||
      "",

    // Coordenadas utilizadas pelo mapa
    latitude:
      evento.latitude == null
        ? null
        : Number(evento.latitude),

    longitude:
      evento.longitude == null
        ? null
        : Number(evento.longitude),

    type: "evento",
  };
}

/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

function App() {
  /*
  |--------------------------------------------------------------------------
  | Usuário
  |--------------------------------------------------------------------------
  */

  const [usuario, setUsuario] = useState(() => obterUsuario());

  /*
  |--------------------------------------------------------------------------
  | Tela inicial
  |--------------------------------------------------------------------------
  */

  const [telaAtual, setTelaAtual] = useState(() => {
    const usuarioSalvo = obterUsuario();

    if (!usuarioSalvo) {
      return "login";
    }

    if (usuarioSalvo.tipo === "produtor") {
      return "produtor";
    }

    return "explorar";
  });

  /*
  |--------------------------------------------------------------------------
  | Mapa
  |--------------------------------------------------------------------------
  */

  const [selectedCategory, setSelectedCategory] =
    useState("todos");

  const [searchTerm, setSearchTerm] = useState("");

  const [userLocation, setUserLocation] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Calendário
  |--------------------------------------------------------------------------
  */

  const [currentDate, setCurrentDate] = useState(
    () => new Date()
  );

  const [selectedDate, setSelectedDate] = useState(
    () => new Date()
  );

  /*
  |--------------------------------------------------------------------------
  | Eventos vindos do MongoDB
  |--------------------------------------------------------------------------
  */

  const [apiEvents, setApiEvents] = useState([]);

  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (
      telaAtual !== "agenda" &&
      telaAtual !== "explorar"
    ) {
      return;
    }

    let ativo = true;

    async function buscarEventos() {
      try {
        setLoadingEvents(true);

        const resposta = await fetch(API_EVENTOS);

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível buscar os eventos."
          );
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error(
            "A resposta da API não possui uma lista de eventos."
          );
        }

        const eventosNormalizados = dados
          .map(normalizarEvento)
          .filter((evento) => {
            return (
              evento.date &&
              ![
                "inativo",
                "cancelado",
                "pendente",
              ].includes(evento.status)
            );
          });

        if (ativo) {
          setApiEvents(eventosNormalizados);
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar eventos:",
          erro
        );
      } finally {
        if (ativo) {
          setLoadingEvents(false);
        }
      }
    }

    buscarEventos();

    return () => {
      ativo = false;
    };
  }, [telaAtual]);

  /*
  |--------------------------------------------------------------------------
  | Dados do produtor
  |--------------------------------------------------------------------------
  */

  const [producer, setProducer] = useState(() => {
    const savedProducer = localStorage.getItem(
      "artismap-producer"
    );

    if (!savedProducer) {
      return null;
    }

    try {
      return JSON.parse(savedProducer);
    } catch {
      return null;
    }
  });

  const [producerEvents, setProducerEvents] = useState(() => {
    const savedEvents = localStorage.getItem(
      "artismap-producer-events"
    );

    if (!savedEvents) {
      return [];
    }

    try {
      return JSON.parse(savedEvents);
    } catch {
      return [];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Lista geral de eventos
  |--------------------------------------------------------------------------
  */

  const events = useMemo(() => {
    const publishedProducerEvents = producerEvents
      .filter(
        (event) => event.status === "Publicado"
      )
      .map((event) => ({
        ...event,

        id: String(event.id),

        title:
          event.title ||
          event.titulo,

        category:
          event.category ||
          event.categoria,

        date: String(
          event.date ||
          event.data ||
          ""
        ).slice(0, 10),

        time:
          event.time ||
          event.horario ||
          "",

        location:
          event.location ||
          event.local ||
          "",

        latitude:
          event.latitude == null
            ? null
            : Number(event.latitude),

        longitude:
          event.longitude == null
            ? null
            : Number(event.longitude),
      }));

    return [
      ...initialEvents,
      ...apiEvents,
      ...publishedProducerEvents,
    ];
  }, [apiEvents, producerEvents]);

  /*
  |--------------------------------------------------------------------------
  | Eventos favoritos
  |--------------------------------------------------------------------------
  */

  const [savedEvents, setSavedEvents] = useState(() => {
    try {
      const email =
        obterUsuario()?.email || "visitante";

      return JSON.parse(
        localStorage.getItem(
          `artismap-favoritos-${email}`
        ) || "[]"
      );
    } catch {
      return [];
    }
  });

  function persistirSalvos(lista) {
    setSavedEvents(lista);

    const email = usuario?.email || "visitante";

    localStorage.setItem(
      `artismap-favoritos-${email}`,
      JSON.stringify(lista)
    );
  }

  function toggleSavedEvent(evento) {
    const id = String(evento.id);

    const jaSalvo = savedEvents.some(
      (item) => String(item.id) === id
    );

    persistirSalvos(
      jaSalvo
        ? savedEvents.filter(
            (item) => String(item.id) !== id
          )
        : [...savedEvents, evento]
    );
  }

  function removerEventoSalvo(eventId) {
    persistirSalvos(
      savedEvents.filter(
        (item) =>
          String(item.id) !== String(eventId)
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Pontos do mapa
  |--------------------------------------------------------------------------
  */

  const mapPoints = useMemo(() => {
    // Transforma os eventos em pontos que o mapa consegue exibir.
    const eventosComLocalizacao = events
      .filter((event) => {
        return (
          Number.isFinite(Number(event.latitude)) &&
          Number.isFinite(Number(event.longitude)) &&
          Number(event.latitude) !== 0 &&
          Number(event.longitude) !== 0
        );
      })
      .map((event) => ({
        ...event,

        id: String(event.id),

        name:
          event.title ||
          event.titulo ||
          "Evento sem título",

        category: normalizarCategoria(
          event.category || event.categoria
        ),

        description:
          event.description ||
          event.descricao ||
          "",

        address:
          event.address ||
          event.endereco ||
          event.location ||
          "",

        city:
          event.city ||
          event.cidade ||
          "Fortaleza",

        price:
          event.price ||
          event.preco ||
          "Não informado",

        type: "evento",
      }));

    // Junta os eventos aos pontos culturais já cadastrados.
    return [
      ...culturalPoints,
      ...eventosComLocalizacao,
    ];
  }, [events]);

  /*
  |--------------------------------------------------------------------------
  | Filtros do mapa
  |--------------------------------------------------------------------------
  */

  const filteredPoints = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const categoriaSelecionada =
      normalizarCategoria(selectedCategory);

    return mapPoints.filter((point) => {
      const categoriaPonto =
        normalizarCategoria(point.category);

      const categoryMatches =
        selectedCategory === "todos" ||
        categoriaPonto === categoriaSelecionada;

      if (!categoryMatches) {
        return false;
      }

      if (!term) {
        return true;
      }

      const nome = String(
        point.name || point.title || ""
      ).toLowerCase();

      const descricao = String(
        point.description || ""
      ).toLowerCase();

      const endereco = String(
        point.address || point.location || ""
      ).toLowerCase();

      const cidade = String(
        point.city || ""
      ).toLowerCase();

      return (
        nome.includes(term) ||
        descricao.includes(term) ||
        endereco.includes(term) ||
        cidade.includes(term)
      );
    });
  }, [
    mapPoints,
    selectedCategory,
    searchTerm,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Eventos da data selecionada
  |--------------------------------------------------------------------------
  */

  const selectedEvents = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dateString =
      `${selectedDate.getFullYear()}-` +
      `${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-` +
      `${String(
        selectedDate.getDate()
      ).padStart(2, "0")}`;

    return events.filter((event) => {
      return (
        event.date === dateString &&
        ![
          "inativo",
          "cancelado",
          "pendente",
          "Cancelado",
        ].includes(event.status)
      );
    });
  }, [selectedDate, events]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  function handleLogin(usuarioLogado) {
    setUsuario(usuarioLogado);

    try {
      setSavedEvents(
        JSON.parse(
          localStorage.getItem(
            `artismap-favoritos-${
              usuarioLogado.email || "visitante"
            }`
          ) || "[]"
        )
      );
    } catch {
      setSavedEvents([]);
    }

    if (usuarioLogado.tipo === "produtor") {
      setTelaAtual("produtor");
      return;
    }

    setTelaAtual("explorar");
  }

  /*
  |--------------------------------------------------------------------------
  | Cadastro
  |--------------------------------------------------------------------------
  */

  function handleCadastro(usuarioCadastrado) {
    setUsuario(usuarioCadastrado);

    try {
      setSavedEvents(
        JSON.parse(
          localStorage.getItem(
            `artismap-favoritos-${
              usuarioCadastrado.email || "visitante"
            }`
          ) || "[]"
        )
      );
    } catch {
      setSavedEvents([]);
    }

    if (usuarioCadastrado.tipo === "produtor") {
      setTelaAtual("produtor");
      return;
    }

    setTelaAtual("explorar");
  }

  /*
  |--------------------------------------------------------------------------
  | Foto de perfil
  |--------------------------------------------------------------------------
  */

  async function handlePhotoChange(arquivo) {
    if (!usuario?.id) {
      throw new Error(
        "Faça login novamente para alterar sua foto."
      );
    }

    const usuarioAtualizado =
      await atualizarFotoPerfil(
        usuario.id,
        arquivo
      );

    setUsuario(usuarioAtualizado);

    return usuarioAtualizado;
  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  function handleLogout() {
    logoutUsuario();

    setUsuario(null);
    setTelaAtual("login");
  }

  /*
  |--------------------------------------------------------------------------
  | Dados do produtor
  |--------------------------------------------------------------------------
  */

  function handleProducerSave(producerData) {
    setProducer(producerData);

    localStorage.setItem(
      "artismap-producer",
      JSON.stringify(producerData)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Salvar eventos do produtor
  |--------------------------------------------------------------------------
  */

  function saveProducerEvents(updatedEvents) {
    setProducerEvents(updatedEvents);

    localStorage.setItem(
      "artismap-producer-events",
      JSON.stringify(updatedEvents)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Adicionar evento do produtor
  |--------------------------------------------------------------------------
  */

  function handleAddEvent(newEvent) {
    const updatedEvents = [
      ...producerEvents,
      newEvent,
    ];

    saveProducerEvents(updatedEvents);
  }

  /*
  |--------------------------------------------------------------------------
  | Atualizar evento do produtor
  |--------------------------------------------------------------------------
  */

  function handleUpdateEvent(updatedEvent) {
    const updatedEvents = producerEvents.map(
      (event) =>
        String(event.id) === String(updatedEvent.id)
          ? updatedEvent
          : event
    );

    saveProducerEvents(updatedEvents);
  }

  /*
  |--------------------------------------------------------------------------
  | Cancelar evento do produtor
  |--------------------------------------------------------------------------
  */

  function handleCancelEvent(eventId) {
    const updatedEvents = producerEvents.map(
      (event) =>
        String(event.id) === String(eventId)
          ? {
              ...event,
              status: "Cancelado",
              cancelledAt: new Date().toISOString(),
            }
          : event
    );

    saveProducerEvents(updatedEvents);
  }

  /*
  |--------------------------------------------------------------------------
  | Aprovar evento do produtor
  |--------------------------------------------------------------------------
  */

  function handleApproveEvent(eventId) {
    const updatedEvents = producerEvents.map(
      (event) =>
        String(event.id) === String(eventId)
          ? {
              ...event,
              status: "Publicado",
              approvedAt: new Date().toISOString(),
            }
          : event
    );

    saveProducerEvents(updatedEvents);
  }

  /*
  |--------------------------------------------------------------------------
  | Navegação do calendário
  |--------------------------------------------------------------------------
  */

  function handlePreviousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  }

  function handleDateChange(date) {
    setSelectedDate(date);

    if (
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    ) {
      setCurrentDate(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );
    }
  }

  function formatSelectedDate() {
    if (!selectedDate) {
      return "";
    }

    return selectedDate.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Clique no evento
  |--------------------------------------------------------------------------
  */

  function handleEventClick(event) {
    alert(
      `Evento selecionado: ${event.title}\n\n` +
      "Esta ação será conectada à página completa do evento no PB04."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onCriarConta={() =>
          setTelaAtual("cadastro")
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CADASTRO
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "cadastro") {
    return (
      <Cadastro
        onCadastro={handleCadastro}
        onVoltar={() =>
          setTelaAtual("login")
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ÁREA DO PRODUTOR
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "produtor") {
    if (
      !usuario ||
      usuario.tipo !== "produtor"
    ) {
      return (
        <Login
          onLogin={handleLogin}
          onCriarConta={() =>
            setTelaAtual("cadastro")
          }
        />
      );
    }

    return (
      <ProducerArea
        usuario={usuario}
        onPhotoChange={handlePhotoChange}
        producer={producer}
        onProducerSave={handleProducerSave}
        events={producerEvents}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onCancelEvent={handleCancelEvent}
        onApproveEvent={handleApproveEvent}
        onBack={() =>
          setTelaAtual("explorar")
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TELAS DO USUÁRIO (COM NAVBAR ÚNICA E FIXA)
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {telaAtual === "salvos" && (
        <SavedEvents
          events={savedEvents}
          fotoPerfil={usuario?.fotoPerfil}
          onRemove={removerEventoSalvo}
          onOpenExplore={() => setTelaAtual("explorar")}
          onOpenMap={() => setTelaAtual("mapa")}
          onOpenProfile={() => setTelaAtual("perfil")}
        />
      )}

      {telaAtual === "perfil" && (
        <UserProfile
          usuario={usuario}
          onPhotoChange={handlePhotoChange}
          onBack={() => setTelaAtual("explorar")}
          onLogout={handleLogout}
        />
      )}

      {telaAtual === "agenda" && (
        <main className="app agenda-screen">
          <header className="top-bar">
            <button
              type="button"
              className="back-button"
              onClick={() => setTelaAtual("explorar")}
              aria-label="Voltar"
            >
              ‹
            </button>

            <div>
              <h1>Agenda</h1>
              <p>Eventos culturais do mês</p>
            </div>

            <div className="top-bar-actions">
              <button
                type="button"
                className="catalog-button"
                onClick={() => setTelaAtual("catalogo")}
              >
                Catálogo
              </button>

              <button
                type="button"
                className="profile-button"
                aria-label="Abrir perfil"
                onClick={() => setTelaAtual("perfil")}
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
            </div>
          </header>

          <Calendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDateChange={handleDateChange}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />

          <section className="events-section">
            <p className="selected-date">
              {formatSelectedDate()}
            </p>

            {loadingEvents && (
              <p>Carregando eventos...</p>
            )}

            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                />
              ))
            ) : (
              !loadingEvents && (
                <div className="empty-state">
                  <p>
                    Nenhum evento encontrado nesta data.
                  </p>
                </div>
              )
            )}
          </section>
        </main>
      )}

      {telaAtual === "catalogo" && (
        <CatalogoEventos
          usuario={usuario}
          onOpenProfile={() => setTelaAtual("perfil")}
          onVoltar={() => setTelaAtual("agenda")}
        />
      )}

      {telaAtual === "explorar" && (
        <main className="explore-screen-wrapper">
          <ExploreEvents
            events={events}
            savedEvents={savedEvents}
            onToggleSaved={toggleSavedEvent}
            fotoPerfil={usuario?.fotoPerfil}
            onOpenMap={() => setTelaAtual("mapa")}
            onOpenAgenda={() => setTelaAtual("agenda")}
            onOpenSaved={() => setTelaAtual("salvos")}
            onOpenProfile={() => setTelaAtual("perfil")}
            />
            </main>
          )}

      {telaAtual === "mapa" && (
        <main className="app">
          <header className="top-area">
            <div className="top-controls">
              

              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
              />

            </div>

            <CategoryFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <p className="map-hint">
              Toque em um ícone para ver informações culturais
            </p>
          </header>

          <MapView
            points={filteredPoints}
            userLocation={userLocation}
          />

          <div className="map-counter">
            📍 {filteredPoints.length}{" "}
            {filteredPoints.length === 1
              ? "ponto"
              : "pontos"}
          </div>

          <UserLocationButton
            onLocationFound={setUserLocation}
          />
        </main>
      )}

      <BottomNav telaAtual={telaAtual} onNavigate={setTelaAtual} />
    </>
  );
}

export default App;