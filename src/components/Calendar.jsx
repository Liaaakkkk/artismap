import { useMemo } from "react";

function Calendar({
  currentDate,
  selectedDate,
  events,
  onDateChange,
  onPreviousMonth,
  onNextMonth
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "short"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const result = [];

    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [year, month, firstDay, daysInMonth]);

  function hasEvent(day) {
    if (!day) return false;

    const dateString = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    return events.some((event) => event.date === dateString);
  }

  function isSelected(day) {
    if (!day || !selectedDate) return false;

    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  }

  function handleDayClick(day) {
    if (!day) return;

    const newDate = new Date(year, month, day);

    onDateChange(newDate);
  }

  return (
    <section className="calendar">
      <div className="calendar-header">
        <button
          className="month-button"
          onClick={onPreviousMonth}
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <h2>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}{" "}
          {year}
        </h2>

        <button
          className="month-button"
          onClick={onNextMonth}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="weekdays">
        <span>D</span>
        <span>S</span>
        <span>T</span>
        <span>Q</span>
        <span>Q</span>
        <span>S</span>
        <span>S</span>
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => (
          <button
            key={index}
            className={`calendar-day
              ${isSelected(day) ? "selected" : ""}
              ${hasEvent(day) ? "has-event" : ""}
            `}
            onClick={() => handleDayClick(day)}
            disabled={!day}
          >
            {day}

            {hasEvent(day) && (
              <span className="event-dot"></span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Calendar;