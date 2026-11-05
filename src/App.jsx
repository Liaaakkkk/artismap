import { useMemo, useState } from "react";

import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import ProducerArea from "./components/ProducerArea";
import CatalogoEventos from "./pages/CatalogoEventos";
import ExploreEvents from "./pages/ExploreEvents";

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

/*
|--------------------------------------------------------------------------
| Eventos iniciais da agenda
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
| APP
|--------------------------------------------------------------------------
*/

function App() {
  /*
  |--------------------------------------------------------------------------
  | Usuário
  |--------------------------------------------------------------------------
  */

  const [usuario, setUsuario] = useState(() =>
    obterUsuario()
  );

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

  const [searchTerm, setSearchTerm] =
    useState("");

  const [userLocation, setUserLocation] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Calendário
  |--------------------------------------------------------------------------
  */

  const [currentDate, setCurrentDate] =
    useState(new Date(2026, 8, 15));

  const [selectedDate, setSelectedDate] =
    useState(new Date(2026, 8, 15));

  /*
  |--------------------------------------------------------------------------
  | Produtor
  |--------------------------------------------------------------------------
  */

  const [producer, setProducer] = useState(() => {
    const savedProducer =
      localStorage.getItem("artismap-producer");

    if (!savedProducer) {
      return null;
    }

    try {
      return JSON.parse(savedProducer);
    } catch {
      return null;
    }
  });

  const [producerEvents, setProducerEvents] =
    useState(() => {
      const savedEvents =
        localStorage.getItem(
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
  | Eventos
  |--------------------------------------------------------------------------
  */

  const [events, setEvents] = useState(() => {
    const savedEvents =
      localStorage.getItem(
        "artismap-producer-events"
      );

    if (!savedEvents) {
      return initialEvents;
    }

    try {
      const saved = JSON.parse(savedEvents);

      const published = saved.filter(
        (event) =>
          event.status === "Publicado"
      );

      return [
        ...initialEvents,
        ...published,
      ];
    } catch {
      return initialEvents;
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Filtro do mapa
  |--------------------------------------------------------------------------
  */

  const filteredPoints = useMemo(() => {
    const term = searchTerm
      .trim()
      .toLowerCase();

    return culturalPoints.filter((point) => {
      const categoryMatches =
        selectedCategory === "todos" ||
        point.category === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        point.name
          .toLowerCase()
          .includes(term) ||
        point.description
          .toLowerCase()
          .includes(term) ||
        point.address
          .toLowerCase()
          .includes(term) ||
        point.city
          .toLowerCase()
          .includes(term)
      );
    });
  }, [selectedCategory, searchTerm]);

  /*
  |--------------------------------------------------------------------------
  | Eventos selecionados no calendário
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

    return events.filter(
      (event) =>
        event.date === dateString &&
        event.status !== "Cancelado"
    );
  }, [selectedDate, events]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  function handleLogin(usuarioLogado) {
    setUsuario(usuarioLogado);

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

    if (usuarioCadastrado.tipo === "produtor") {
      setTelaAtual("produtor");
      return;
    }

    setTelaAtual("explorar");
  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  async function handlePhotoChange(arquivo) {
    if (!usuario?.id) {
      throw new Error("Faça login novamente para alterar sua foto.");
    }

    const usuarioAtualizado = await atualizarFotoPerfil(
      usuario.id,
      arquivo
    );

    setUsuario(usuarioAtualizado);
    return usuarioAtualizado;
  }

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

  function saveProducerEvents(
    updatedEvents
  ) {
    setProducerEvents(updatedEvents);

    localStorage.setItem(
      "artismap-producer-events",
      JSON.stringify(updatedEvents)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Atualizar agenda
  |--------------------------------------------------------------------------
  */

  function refreshPublishedEvents(
    producerEventList
  ) {
    const publishedEvents =
      producerEventList.filter(
        (event) =>
          event.status === "Publicado"
      );

    setEvents([
      ...initialEvents,
      ...publishedEvents,
    ]);
  }

  /*
  |--------------------------------------------------------------------------
  | Adicionar evento
  |--------------------------------------------------------------------------
  */

  function handleAddEvent(newEvent) {
    const updatedEvents = [
      ...producerEvents,
      newEvent,
    ];

    saveProducerEvents(updatedEvents);

    refreshPublishedEvents(
      updatedEvents
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Atualizar evento
  |--------------------------------------------------------------------------
  */

  function handleUpdateEvent(
    updatedEvent
  ) {
    const updatedEvents =
      producerEvents.map((event) =>
        event.id === updatedEvent.id
          ? updatedEvent
          : event
      );

    saveProducerEvents(updatedEvents);

    refreshPublishedEvents(
      updatedEvents
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Cancelar evento
  |--------------------------------------------------------------------------
  */

  function handleCancelEvent(eventId) {
    const updatedEvents =
      producerEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "Cancelado",
              cancelledAt:
                new Date().toISOString(),
            }
          : event
      );

    saveProducerEvents(updatedEvents);

    refreshPublishedEvents(
      updatedEvents
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Aprovar evento
  |--------------------------------------------------------------------------
  */

  function handleApproveEvent(eventId) {
    const updatedEvents =
      producerEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "Publicado",
              approvedAt:
                new Date().toISOString(),
            }
          : event
      );

    saveProducerEvents(updatedEvents);

    refreshPublishedEvents(
      updatedEvents
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Calendário
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
      date.getMonth() !==
        currentDate.getMonth() ||
      date.getFullYear() !==
        currentDate.getFullYear()
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
    /*
    Segurança no frontend:
    somente usuário com tipo produtor
    pode abrir essa tela.
    */

    if (
      !usuario ||
      usuario.tipo !== "produtor"
    ) {
      setTelaAtual("mapa");
      return null;
    }

    return (
      <ProducerArea
        usuario={usuario}
        onPhotoChange={handlePhotoChange}
        producer={producer}
        onProducerSave={
          handleProducerSave
        }
        events={producerEvents}
        onAddEvent={handleAddEvent}
        onUpdateEvent={
          handleUpdateEvent
        }
        onCancelEvent={
          handleCancelEvent
        }
        onApproveEvent={
          handleApproveEvent
        }
        onBack={() =>
          setTelaAtual("explorar")
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PERFIL
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "perfil") {
    return (
      <main className="app profile-screen">
        <section className="profile-page">
          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              setTelaAtual("explorar")
            }
          >
            ← Voltar
          </button>

          <div className="profile-avatar" style={{
            width: "112px",
            height: "112px",
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            background: "#eee",
          }}>
            {usuario?.fotoPerfil ? (
              <img
                src={usuario.fotoPerfil}
                alt="Foto de perfil"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              "👤"
            )}
          </div>

          <label
            htmlFor="foto-perfil-usuario"
            className="producer-secondary-button"
            style={{
              display: "inline-block",
              cursor: "pointer",
              marginBottom: "18px",
            }}
          >
            Alterar foto
          </label>
          <input
            id="foto-perfil-usuario"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={async (event) => {
              const arquivo = event.target.files?.[0];
              if (!arquivo) return;

              try {
                await handlePhotoChange(arquivo);
                alert("Foto de perfil atualizada!");
              } catch (error) {
                alert(error.message);
              } finally {
                event.target.value = "";
              }
            }}
          />

          <h1>Meu perfil</h1>

          <p className="profile-email-page">
            {usuario?.email}
          </p>

          <p>
            Tipo de conta:{" "}
            <strong>
              {usuario?.tipo === "produtor"
                ? "Produtor"
                : "Usuário"}
            </strong>
          </p>

          {usuario?.tipo ===
            "produtor" && (
            <button
              type="button"
              className="producer-profile-button"
              onClick={() =>
                setTelaAtual("produtor")
              }
            >
              Área do produtor
            </button>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sair da conta
          </button>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AGENDA
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "agenda") {
    return (
      <main className="app">
        <header className="top-bar">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              setTelaAtual("explorar")
            }
            aria-label="Voltar"
          >
            ‹
          </button>

          <div>
            <h1>Agenda</h1>

            <p>
              Eventos culturais do mês
            </p>
          </div>

          <button
            type="button"
            className="catalog-button"
            onClick={() =>
              setTelaAtual("catalogo")
            }
          >
            Catálogo
          </button>
        </header>

        <Calendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          onDateChange={handleDateChange}
          onPreviousMonth={
            handlePreviousMonth
          }
          onNextMonth={
            handleNextMonth
          }
        />

        <section className="events-section">
          <p className="selected-date">
            {formatSelectedDate()}
          </p>

          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() =>
                  handleEventClick(event)
                }
              />
            ))
          ) : (
            <div className="empty-state">
              <p>
                Nenhum evento encontrado nesta
                data.
              </p>
            </div>
          )}
        </section>

        <nav className="bottom-navigation">
          <button
            type="button"
            onClick={() =>
              setTelaAtual("explorar")
            }
          >
            <span>⌂</span>
            <small>Explorar</small>
          </button>

          <button type="button">
            <span>♡</span>
            <small>Salvos</small>
          </button>

          <button
            type="button"
            onClick={() =>
              setTelaAtual("perfil")
            }
          >
            <span>♙</span>
            <small>Perfil</small>
          </button>
        </nav>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CATÁLOGO
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "catalogo") {
    return (
      <CatalogoEventos
        usuario={usuario}
        onVoltar={() =>
          setTelaAtual("agenda")
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EXPLORAR EVENTOS
  |--------------------------------------------------------------------------
  */

  if (telaAtual === "explorar") {
    return (
      <ExploreEvents
        events={events}
        onOpenMap={() => setTelaAtual("mapa")}
        onOpenAgenda={() => setTelaAtual("agenda")}
        onOpenProfile={() => setTelaAtual("perfil")}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAPA
  |--------------------------------------------------------------------------
  */

  return (
    <main className="app">
      <header className="top-area">
        <div className="top-controls">
          <button
            type="button"
            className="menu-button"
            aria-label="Abrir agenda"
            onClick={() =>
              setTelaAtual("agenda")
            }
          >
            ☰
          </button>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <button
            type="button"
            className="profile-button"
            aria-label="Abrir perfil"
            onClick={() =>
              setTelaAtual("perfil")
            }
          >
            👤
          </button>
        </div>

        <CategoryFilters
          selectedCategory={
            selectedCategory
          }
          onCategoryChange={
            setSelectedCategory
          }
        />

        <p className="map-hint">
          Toque em um ícone para ver
          informações culturais
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
        onLocationFound={
          setUserLocation
        }
      />

      <nav className="bottom-navigation">
        <button
          type="button"
          className="active"
          onClick={() =>
            setTelaAtual("explorar")
          }
        >
          <span>⌂</span>
          <small>Explorar</small>
        </button>

        <button type="button">
          <span>♡</span>
          <small>Salvos</small>
        </button>

        <button
          type="button"
          onClick={() =>
            setTelaAtual("perfil")
          }
        >
          <span>♙</span>
          <small>Perfil</small>
        </button>
      </nav>
    </main>
  );
}

export default App;