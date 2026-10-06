import { useState } from "react";

const emptyProducer = {
  name: "",
  organization: "",
  email: "",
  phone: "",
  city: ""
};

const emptyEvent = {
  title: "",
  category: "",
  date: "",
  time: "",
  location: "",
  description: "",
  contact: ""
};

const categories = [
  "MÚSICA",
  "TEATRO",
  "DANÇA",
  "ARTES VISUAIS",
  "LITERATURA",
  "CINEMA",
  "CULTURA POPULAR",
  "OUTROS"
];

function ProducerArea({
  producer,
  onProducerSave,
  events,
  onAddEvent,
  onUpdateEvent,
  onCancelEvent,
  onApproveEvent,
  onBack
}) {
  const [producerForm, setProducerForm] = useState(
    producer || emptyProducer
  );

  const [eventForm, setEventForm] = useState(emptyEvent);

  const [editingId, setEditingId] = useState(null);

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState("");

  const [section, setSection] = useState(
    producer ? "dashboard" : "producer"
  );

  function handleProducerChange(event) {
    const { name, value } = event.target;

    setProducerForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateProducer() {
    const newErrors = {};

    if (!producerForm.name.trim()) {
      newErrors.name = "Informe o nome do produtor.";
    }

    if (!producerForm.organization.trim()) {
      newErrors.organization = "Informe o nome da organização.";
    }

    if (!producerForm.email.trim()) {
      newErrors.email = "Informe o e-mail.";
    } else if (!producerForm.email.includes("@")) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (!producerForm.phone.trim()) {
      newErrors.phone = "Informe o telefone.";
    }

    if (!producerForm.city.trim()) {
      newErrors.city = "Informe a cidade.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleProducerSubmit(event) {
    event.preventDefault();

    if (!validateProducer()) {
      setMessage("");
      return;
    }

    onProducerSave({
      ...producerForm,
      source: "Cadastro informado pelo próprio produtor",
      updatedAt: new Date().toISOString()
    });

    setErrors({});
    setMessage("Cadastro do produtor salvo com sucesso.");
    setSection("dashboard");
  }

  function handleEventChange(event) {
    const { name, value } = event.target;

    setEventForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateEvent() {
    const newErrors = {};

    if (!eventForm.title.trim()) {
      newErrors.title = "Informe o título do evento.";
    }

    if (!eventForm.category) {
      newErrors.category = "Selecione uma categoria.";
    }

    if (!eventForm.date) {
      newErrors.date = "Informe a data.";
    }

    if (!eventForm.time) {
      newErrors.time = "Informe o horário.";
    }

    if (!eventForm.location.trim()) {
      newErrors.location = "Informe o local.";
    }

    if (!eventForm.description.trim()) {
      newErrors.description = "Informe uma descrição.";
    }

    if (!eventForm.contact.trim()) {
      newErrors.contact = "Informe um contato para o evento.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleEventSubmit(event) {
    event.preventDefault();

    if (!validateEvent()) {
      setMessage("");
      return;
    }

    const eventData = {
      ...eventForm,
      category: eventForm.category.toUpperCase(),
      status: "Pendente",
      source: "Informação enviada pelo produtor",
      producerName: producerForm.name,
      producerOrganization: producerForm.organization,
      submittedAt: new Date().toISOString()
    };

    if (editingId) {
      onUpdateEvent({
        ...eventData,
        id: editingId
      });

      setMessage(
        "Evento atualizado e reenviado para moderação."
      );
    } else {
      onAddEvent({
        ...eventData,
        id: Date.now()
      });

      setMessage(
        "Evento enviado com sucesso. Aguarde a moderação."
      );
    }

    setEventForm(emptyEvent);
    setEditingId(null);
    setErrors({});
    setSection("dashboard");
  }

  function handleEdit(event) {
    setEventForm({
      title: event.title || "",
      category: event.category || "",
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      description: event.description || "",
      contact: event.contact || ""
    });

    setEditingId(event.id);
    setErrors({});
    setMessage("");
    setSection("event");
  }

  function handleCancel(event) {
    const confirmed = window.confirm(
      "Deseja realmente informar o cancelamento deste evento?"
    );

    if (!confirmed) return;

    onCancelEvent(event.id);

    setMessage(
      "Cancelamento registrado. O evento não será exibido na Agenda."
    );
  }

  function handleApprove(event) {
    onApproveEvent(event.id);

    setMessage(
      "Evento aprovado na demonstração de moderação."
    );
  }

  function getStatusClass(status) {
    if (status === "Publicado") {
      return "producer-status producer-status-approved";
    }

    if (status === "Cancelado") {
      return "producer-status producer-status-cancelled";
    }

    return "producer-status producer-status-pending";
  }

  return (
    <main className="producer-area">
      <header className="producer-header">
        <button
          className="back-button"
          onClick={onBack}
          aria-label="Voltar para a agenda"
        >
          ‹
        </button>

        <div>
          <h1>Área do produtor</h1>
          <p>Cadastro e participação cultural</p>
        </div>
      </header>

      <section className="producer-content">
        {message && (
          <div className="producer-message">
            {message}
          </div>
        )}

        {section === "producer" && (
          <form
            className="producer-card"
            onSubmit={handleProducerSubmit}
          >
            <div className="producer-card-header">
              <span>ETAPA 1</span>
              <h2>Cadastro do produtor</h2>
              <p>
                Informe os dados de quem é responsável pelas
                informações dos eventos.
              </p>
            </div>

            <label>
              Nome completo
              <input
                type="text"
                name="name"
                value={producerForm.name}
                onChange={handleProducerChange}
                placeholder="Ex.: Ana Carolina Souza"
              />
              {errors.name && (
                <small className="producer-error">
                  {errors.name}
                </small>
              )}
            </label>

            <label>
              Organização ou coletivo
              <input
                type="text"
                name="organization"
                value={producerForm.organization}
                onChange={handleProducerChange}
                placeholder="Ex.: Coletivo Arte Viva"
              />
              {errors.organization && (
                <small className="producer-error">
                  {errors.organization}
                </small>
              )}
            </label>

            <label>
              E-mail
              <input
                type="email"
                name="email"
                value={producerForm.email}
                onChange={handleProducerChange}
                placeholder="produtor@email.com"
              />
              {errors.email && (
                <small className="producer-error">
                  {errors.email}
                </small>
              )}
            </label>

            <label>
              Telefone
              <input
                type="tel"
                name="phone"
                value={producerForm.phone}
                onChange={handleProducerChange}
                placeholder="(85) 99999-9999"
              />
              {errors.phone && (
                <small className="producer-error">
                  {errors.phone}
                </small>
              )}
            </label>

            <label>
              Cidade
              <input
                type="text"
                name="city"
                value={producerForm.city}
                onChange={handleProducerChange}
                placeholder="Fortaleza"
              />
              {errors.city && (
                <small className="producer-error">
                  {errors.city}
                </small>
              )}
            </label>

            <div className="producer-source">
              <strong>Fonte da informação</strong>
              <span>
                Cadastro informado pelo próprio produtor
              </span>
            </div>

            <button
              className="producer-primary-button"
              type="submit"
            >
              Salvar cadastro
            </button>
          </form>
        )}

        {section === "dashboard" && (
          <>
            <section className="producer-welcome">
              <span>PRODUTOR CADASTRADO</span>
              <h2>{producerForm.name}</h2>
              <p>{producerForm.organization}</p>

              <button
                className="producer-secondary-button"
                onClick={() => setSection("producer")}
              >
                Editar cadastro
              </button>
            </section>

            <div className="producer-actions">
              <button
                className="producer-primary-button"
                onClick={() => {
                  setEditingId(null);
                  setEventForm(emptyEvent);
                  setErrors({});
                  setSection("event");
                }}
              >
                + Cadastrar evento
              </button>
            </div>

            <section className="producer-card">
              <div className="producer-card-header">
                <span>MEUS EVENTOS</span>
                <h2>Eventos enviados</h2>
                <p>
                  Acompanhe o estado das informações enviadas
                  para a Agenda.
                </p>
              </div>

              {events.length === 0 ? (
                <div className="producer-empty">
                  <p>
                    Você ainda não cadastrou nenhum evento.
                  </p>
                </div>
              ) : (
                <div className="producer-event-list">
                  {events.map((event) => (
                    <article
                      className="producer-event"
                      key={event.id}
                    >
                      <div className="producer-event-top">
                        <span>
                          {event.category}
                        </span>

                        <strong
                          className={getStatusClass(
                            event.status
                          )}
                        >
                          {event.status}
                        </strong>
                      </div>

                      <h3>{event.title}</h3>

                      <p>
                        📍 {event.location}
                      </p>

                      <p>
                        ◉ {event.date} às {event.time}
                      </p>

                      <small>
                        Fonte: {event.source}
                      </small>

                      <div className="producer-event-actions">
                        {event.status !== "Cancelado" && (
                          <>
                            <button
                              onClick={() =>
                                handleEdit(event)
                              }
                            >
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                handleCancel(event)
                              }
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {event.status === "Pendente" && (
                          <button
                            className="moderation-button"
                            onClick={() =>
                              handleApprove(event)
                            }
                          >
                            Simular aprovação
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="producer-demo-note">
              <strong>Demonstração de moderação</strong>
              <p>
                O botão "Simular aprovação" representa a ação
                de um moderador. Em uma próxima etapa, essa
                operação deverá ser protegida por autenticação
                e permissão de moderador.
              </p>
            </div>
          </>
        )}

        {section === "event" && (
          <form
            className="producer-card"
            onSubmit={handleEventSubmit}
          >
            <div className="producer-card-header">
              <span>ETAPA 2</span>
              <h2>
                {editingId
                  ? "Editar evento"
                  : "Cadastrar evento"}
              </h2>
              <p>
                Preencha as informações que serão analisadas
                antes da publicação.
              </p>
            </div>

            <label>
              Nome do evento
              <input
                type="text"
                name="title"
                value={eventForm.title}
                onChange={handleEventChange}
                placeholder="Ex.: Festival de Música"
              />
              {errors.title && (
                <small className="producer-error">
                  {errors.title}
                </small>
              )}
            </label>

            <label>
              Categoria
              <select
                name="category"
                value={eventForm.category}
                onChange={handleEventChange}
              >
                <option value="">
                  Selecione uma categoria
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              {errors.category && (
                <small className="producer-error">
                  {errors.category}
                </small>
              )}
            </label>

            <div className="producer-form-row">
              <label>
                Data
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventChange}
                />

                {errors.date && (
                  <small className="producer-error">
                    {errors.date}
                  </small>
                )}
              </label>

              <label>
                Horário
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventChange}
                />

                {errors.time && (
                  <small className="producer-error">
                    {errors.time}
                  </small>
                )}
              </label>
            </div>

            <label>
              Local
              <input
                type="text"
                name="location"
                value={eventForm.location}
                onChange={handleEventChange}
                placeholder="Ex.: Centro Cultural"
              />

              {errors.location && (
                <small className="producer-error">
                  {errors.location}
                </small>
              )}
            </label>

            <label>
              Descrição
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleEventChange}
                placeholder="Descreva o evento, programação e público."
                rows="5"
              />

              {errors.description && (
                <small className="producer-error">
                  {errors.description}
                </small>
              )}
            </label>

            <label>
              Contato do evento
              <input
                type="text"
                name="contact"
                value={eventForm.contact}
                onChange={handleEventChange}
                placeholder="E-mail ou telefone para informações"
              />

              {errors.contact && (
                <small className="producer-error">
                  {errors.contact}
                </small>
              )}
            </label>

            <div className="producer-source">
              <strong>Fonte da informação</strong>
              <span>
                Informação enviada pelo produtor
              </span>
            </div>

            <div className="producer-form-actions">
              <button
                type="button"
                className="producer-secondary-button"
                onClick={() => {
                  setSection("dashboard");
                  setEditingId(null);
                  setEventForm(emptyEvent);
                  setErrors({});
                }}
              >
                Voltar
              </button>

              <button
                className="producer-primary-button"
                type="submit"
              >
                {editingId
                  ? "Atualizar evento"
                  : "Enviar para moderação"}
              </button>
            </div>
          </form>
        )}
      </section>

      <nav className="bottom-navigation producer-navigation">
        <button onClick={onBack}>
          <span>⌂</span>
          <small>Agenda</small>
        </button>

        <button
          className="producer-nav-active"
          onClick={() => setSection("dashboard")}
        >
          <span>♙</span>
          <small>Produtor</small>
        </button>
      </nav>
    </main>
  );
}

export default ProducerArea;
