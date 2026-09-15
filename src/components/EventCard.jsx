function EventCard({ event, onClick }) {
  return (
    <button className="event-card" onClick={onClick}>
      <div className="event-category">
        {event.category}
      </div>

      <div className="event-content">
        <h3>{event.title}</h3>

        <p className="event-info">
          📍 {event.location}
        </p>

        <p className="event-info">
          ◉ {event.time}
        </p>
      </div>
    </button>
  );
}

export default EventCard;