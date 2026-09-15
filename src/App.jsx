import { useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import "./App.css";

const initialEvents = [
  {
    id: 1,
    title: "Arte Urbana",
    category: "ARTE",
    date: "2026-09-15",
    time: "14:00",
    location: "Beco das Artes"
  },
  {
    id: 2,
    title: "Festival de Música",
    category: "MÚSICA",
    date: "2026-09-18",
    time: "19:00",
    location: "Centro Cultural"
  },
  {
    id: 3,
    title: "Exposição Nordeste",
    category: "EXPOSIÇÃO",
    date: "2026-09-20",
    time: "10:00",
    location: "Museu da Cultura"
  },
  {
    id: 4,
    title: "Sarau Cultural",
    category: "LITERATURA",
    date: "2026-09-25",
    time: "18:30",
    location: "Biblioteca Central"
  },
  {
    id: 5,
    title: "Cinema ao Ar Livre",
    category: "CINEMA",
    date: "2026-09-27",
    time: "20:00",
    location: "Praça Cultural"
  }
];

function App() {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 15)
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date(2026, 8, 15)
  );

  const [events] = useState(initialEvents);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];

    const dateString = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      selectedDate.getDate()
    ).padStart(2, "0")}`;

    return events.filter((event) => event.date === dateString);
  }, [selectedDate, events]);

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
    if (!selectedDate) return "";

    return selectedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function handleEventClick(event) {
    alert(
      `Evento selecionado: ${event.title}\n\n` +
      `Esta ação será conectada à página completa do evento no PB04.`
    );
  }

  return (
    <main className="app">
      <header className="top-bar">
        <button className="back-button" aria-label="Voltar">
          ‹
        </button>

        <div>
          <h1>Agenda</h1>
          <p>Eventos culturais do mês</p>
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

        {selectedEvents.length > 0 ? (
          selectedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event)}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>Nenhum evento encontrado nesta data.</p>
          </div>
        )}
      </section>

      <nav className="bottom-navigation">
        <button>
          <span>⌂</span>
          <small>Explorar</small>
        </button>

        <button>
          <span>♡</span>
          <small>Salvos</small>
        </button>

        <button>
          <span>♙</span>
          <small>Perfil</small>
        </button>
      </nav>
    </main>
  );
}

export default App;