import { useEffect, useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import ProducerArea from "./components/ProducerArea";
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

  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem(
      "artismap-producer-events"
    );

    if (!savedEvents) {
      return initialEvents;
    }

    try {
      const producerEvents = JSON.parse(savedEvents);

      return [
        ...initialEvents,
        ...producerEvents.filter(
          (event) => event.status === "Publicado"
        )
      ];
    } catch {
      return initialEvents;
    }
  });

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

  const [screen, setScreen] = useState("agenda");

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];

    const dateString = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      selectedDate.getDate()
    ).padStart(2, "0")}`;

    return events.filter(
      (event) =>
        event.date === dateString &&
        event.status !== "Cancelado"
    );
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

  function handleProducerSave(producerData) {
    setProducer(producerData);

    localStorage.setItem(
      "artismap-producer",
      JSON.stringify(producerData)
    );
  }

  function getProducerEvents() {
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
  }

  function saveProducerEvents(producerEvents) {
    localStorage.setItem(
      "artismap-producer-events",
      JSON.stringify(producerEvents)
    );
  }

  function refreshPublishedEvents(producerEvents) {
    const publishedEvents = producerEvents.filter(
      (event) => event.status === "Publicado"
    );

    setEvents([
      ...initialEvents,
      ...publishedEvents
    ]);
  }

  function handleAddEvent(newEvent) {
    const currentProducerEvents = getProducerEvents();

    const updatedProducerEvents = [
      ...currentProducerEvents,
      newEvent
    ];

    saveProducerEvents(updatedProducerEvents);

    refreshPublishedEvents(updatedProducerEvents);
  }

  function handleUpdateEvent(updatedEvent) {
    const currentProducerEvents = getProducerEvents();

    const updatedProducerEvents =
      currentProducerEvents.map((event) =>
        event.id === updatedEvent.id
          ? updatedEvent
          : event
      );

    saveProducerEvents(updatedProducerEvents);

    refreshPublishedEvents(updatedProducerEvents);
  }

  function handleCancelEvent(eventId) {
    const currentProducerEvents = getProducerEvents();

    const updatedProducerEvents =
      currentProducerEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "Cancelado",
              cancelledAt: new Date().toISOString()
            }
          : event
      );

    saveProducerEvents(updatedProducerEvents);

    refreshPublishedEvents(updatedProducerEvents);
  }

  function handleApproveEvent(eventId) {
    const currentProducerEvents = getProducerEvents();

    const updatedProducerEvents =
      currentProducerEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "Publicado",
              approvedAt: new Date().toISOString()
            }
          : event
      );

    saveProducerEvents(updatedProducerEvents);

    refreshPublishedEvents(updatedProducerEvents);
  }

  if (screen === "producer") {
    return (
      <ProducerArea
        producer={producer}
        onProducerSave={handleProducerSave}
        events={getProducerEvents()}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onCancelEvent={handleCancelEvent}
        onApproveEvent={handleApproveEvent}
        onBack={() => setScreen("agenda")}
      />
    );
  }

  return (
    <main className="app">
      <header className="top-bar">
        <button
          className="back-button"
          aria-label="Voltar"
        >
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
          onClick={() => setScreen("agenda")}
        >
          <span>⌂</span>
          <small>Explorar</small>
        </button>

        <button>
          <span>♡</span>
          <small>Salvos</small>
        </button>

        <button
          onClick={() => setScreen("producer")}
        >
          <span>♙</span>
          <small>Perfil</small>
        </button>
      </nav>
    </main>
  );
}

export default App;
