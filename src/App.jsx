import { useMemo, useState } from "react";

import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import CatalogoEventos from "./pages/CatalogoEventos";
import SearchBar from "./components/SearchBar";
import CategoryFilters from "./components/CategoryFilters";
import MapView from "./components/MapView";
import UserLocationButton from "./components/UserLocationButton";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";

import {
  obterUsuario,
  logoutUsuario,
} from "./utils/auth";

import culturalPoints from "./data/culturalPoints";

import "./App.css";

const initialEvents = [
  {
    id: 1,
    title: "Festival de Música de Fortaleza",
    category: "musica",
    date: "2026-09-20",
    time: "19:00",
    location: "Praça do Ferreira",
  },

  {
    id: 2,
    title: "Teatro Cultural de Fortaleza",
    category: "teatro",
    date: "2026-09-25",
    time: "20:00",
    location: "Rua Major Facundo",
  },

  {
    id: 3,
    title: "Cine Cultura Fortaleza",
    category: "cinema",
    date: "2026-09-28",
    time: "18:30",
    location: "Avenida da Universidade",
  },

  {
    id: 4,
    title: "Casa da Música de Fortaleza",
    category: "musica",
    date: "2026-10-02",
    time: "19:30",
    location: "Avenida Beira-Mar",
  },
];

function App() {
  // --------------------------------
  // CONTROLE DA TELA
  // --------------------------------

  const [telaAtual, setTelaAtual] = useState(() => {
  const usuarioSalvo = obterUsuario();
  
  return usuarioSalvo ? "mapa" : "login";
});

  // --------------------------------
  // USUÁRIO / LOGIN
  // --------------------------------

  const [usuario, setUsuario] = useState(() => {
    return obterUsuario();
  });

  // --------------------------------
  // ESTADOS DO MAPA
  // --------------------------------

  const [selectedCategory, setSelectedCategory] =
    useState("todos");

  const [searchTerm, setSearchTerm] = useState("");

  const [userLocation, setUserLocation] = useState(null);

  // --------------------------------
  // ESTADOS DA AGENDA
  // --------------------------------

  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 20)
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date(2026, 8, 20)
  );

  const [events] = useState(initialEvents);

  // --------------------------------
  // LOGIN
  // --------------------------------

  function handleLogin(usuarioLogado) {
    setUsuario(usuarioLogado);

    setTelaAtual("mapa");
  }

  function handleLogout() {
    logoutUsuario();

    setUsuario(null);

    setTelaAtual("login");
  }

  // --------------------------------
  // FILTRO DOS PONTOS DO MAPA
  // --------------------------------

  const filteredPoints = useMemo(() => {
    return culturalPoints.filter((point) => {
      const matchesCategory =
        selectedCategory === "todos" ||
        point.category === selectedCategory;

      const normalizedSearch = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        normalizedSearch === "" ||
        point.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        point.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        point.address
          .toLowerCase()
          .includes(normalizedSearch) ||
        point.city
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // --------------------------------
  // EVENTOS DA DATA SELECIONADA
  // --------------------------------

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
      (event) => event.date === dateString
    );
  }, [selectedDate, events]);

  // --------------------------------
  // CALENDÁRIO
  // --------------------------------

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

    return selectedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function handleEventClick(event) {
    alert(
      `Evento selecionado: ${event.title}\n\n` +
        `Esta ação será conectada à página completa do evento no PB04.`
    );
  }

  // --------------------------------
  // TELA DE LOGIN
  // --------------------------------

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

if (telaAtual === "cadastro") {
  return (
    <Cadastro
      onCadastro={(usuario) => {
        setUsuario(usuario);
        setTelaAtual("mapa");
      }}
      onVoltar={() =>
        setTelaAtual("login")
      }
    />
  );
}

  // --------------------------------
// TELA DO PERFIL
// --------------------------------

  if (telaAtual === "perfil") {
    return (
      <main className="app profile-screen">
        <section className="profile-page">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => setTelaAtual("mapa")}
          >
            ← Voltar
          </button>

          <div className="profile-avatar">
           👤
          </div>

          <h1>Meu perfil</h1>

          <p className="profile-email-page">
            {usuario?.email}
          </p>

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

  // --------------------------------
  // TELA DO CATÁLOGO
  // --------------------------------

  if (telaAtual === "catalogo") {
    return (
      <CatalogoEventos
        onVoltar={() => setTelaAtual("mapa")}
      />
    );
  }

  // --------------------------------
  // TELA DA AGENDA
  // --------------------------------

  if (telaAtual === "agenda") {
    return (
      <main className="app agenda-screen">
        <header className="top-bar">
          <button
            className="back-button"
            aria-label="Voltar"
            onClick={() => setTelaAtual("mapa")}
          >
            ‹
          </button>

          <div>
            <h1>Agenda</h1>
            <p>Eventos culturais do mês</p>
          </div>

          <button
            className="catalogo-button"
            onClick={() => setTelaAtual("catalogo")}
          >
            Catálogo
          </button>
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
                Nenhum evento encontrado nesta data.
              </p>
            </div>
          )}
        </section>

        <nav className="bottom-navigation">
          <button
            className="bottom-item"
            onClick={() => setTelaAtual("mapa")}
          >
            <span>⌖</span>
            <small>Explorar</small>
          </button>

          <button className="bottom-item">
            <span>♡</span>
            <small>Salvos</small>
          </button>

          <button
            className="bottom-item"
            onClick={() => {
              if (usuario) {
                setTelaAtual("mapa");
              } else {
                setTelaAtual("login");
              }
            }}
          >
            <span>♙</span>
            <small>Perfil</small>
          </button>
        </nav>
      </main>
    );
  }

  // --------------------------------
  // TELA PRINCIPAL DO MAPA
  // --------------------------------

  return (
    <main className="app map-screen">
      <section className="top-area">
        <div className="top-controls">
          <button
            className="menu-button"
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* PERFIL / LOGIN */}
          {usuario ? (
            <button
            type="button"
            className="profile-button"
            aria-label="Abrir perfil"
            onClick={() => setTelaAtual("perfil")}
            >
              👤
              </button>
              ) : (
              <button
              type="button"
              className="profile-button"
              aria-label="Entrar"
              onClick={() => setTelaAtual("login")}
              >
                👤
                </button>
              )}
        </div>

        <p className="filter-hint">
          Toque em um filtro para selecionar uma categoria
        </p>

        <CategoryFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </section>

      <section className="map-area">
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
      </section>

      <nav className="bottom-navigation">
        <button
          className="bottom-item active"
          onClick={() => setTelaAtual("mapa")}
        >
          <span>⌖</span>
          <small>Explorar</small>
        </button>

        <button className="bottom-item">
          <span>♡</span>
          <small>Salvos</small>
        </button>

        <button
          className="bottom-item"
          onClick={() => {
            if (usuario) {
              setTelaAtual("mapa");
            } else {
              setTelaAtual("login");
            }
          }}
        >
          <span>♙</span>
          <small>Perfil</small>
        </button>

        <button
          className="bottom-item"
          onClick={() => setTelaAtual("agenda")}
        >
          <span>▣</span>
          <small>Agenda</small>
        </button>
      </nav>
    </main>
  );
}

export default App;