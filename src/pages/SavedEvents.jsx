import "../styles/SavedEvents.css";

function formatarData(data) {
  if (!data) return "Data a confirmar";
  const partes = String(data).split("-");
  if (partes.length !== 3) return data;
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]))
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
}

function SavedEvents({
  events = [],
  fotoPerfil,
  onRemove,
  onOpenExplore,
  onOpenMap,
  onOpenProfile,
}) {
  return (
    <main className="saved-page">
      <header className="saved-header">
        <div>
          <span className="saved-eyebrow">ARTISMAP • SUA COLEÇÃO</span>
          <h1>Eventos salvos</h1>
          <p>Seus eventos favoritos em um só lugar.</p>
        </div>
        <button
          type="button"
          className="saved-profile-button"
          onClick={onOpenProfile}
          aria-label="Abrir perfil"
        >
          {fotoPerfil ? <img src={fotoPerfil} alt="Foto de perfil" /> : "👤"}
        </button>
      </header>

      <section className="saved-content">
        <div className="saved-heading">
          <div>
            <span>LISTA PESSOAL</span>
            <h2>Meus favoritos</h2>
          </div>
          <strong>{events.length} {events.length === 1 ? "evento" : "eventos"}</strong>
        </div>

        {events.length === 0 ? (
          <div className="saved-empty">
            <span>♡</span>
            <h3>Você ainda não salvou eventos</h3>
            <p>Explore os eventos disponíveis e toque no coração para guardar seus favoritos aqui.</p>
            <button type="button" onClick={onOpenExplore}>Explorar eventos</button>
          </div>
        ) : (
          <div className="saved-list">
            {events.map((evento) => (
              <article className="saved-card" key={evento.id}>
                {evento.imagem && (
                  <img className="saved-image" src={evento.imagem} alt={evento.title} />
                )}
                <div className="saved-card-body">
                  <div className="saved-card-top">
                    <span className="saved-category">{evento.category || "OUTROS"}</span>
                    <button
                      type="button"
                      className="saved-remove"
                      onClick={() => onRemove(evento.id)}
                      aria-label={`Remover ${evento.title} dos salvos`}
                      title="Remover dos salvos"
                    >♥</button>
                  </div>
                  <h3>{evento.title}</h3>
                  {evento.description && <p className="saved-description">{evento.description}</p>}
                  <div className="saved-info">
                    <p><span>▦</span><strong>Data:</strong> {formatarData(evento.date)}</p>
                    {evento.time && <p><span>◷</span><strong>Horário:</strong> {evento.time}</p>}
                    <p><span>⌖</span><strong>Local:</strong> {[evento.location, evento.address, evento.city].filter(Boolean).join(" • ") || "Local a confirmar"}</p>
                  </div>
                  {evento.link && <a href={evento.link} target="_blank" rel="noreferrer">Mais informações ↗</a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <nav className="bottom-navigation saved-navigation">
        <button type="button" onClick={onOpenExplore}>
          <span>⌂</span><small>Explorar</small>
        </button>
        <button type="button" onClick={onOpenMap}>
          <span>⌖</span><small>Mapa</small>
        </button>
        <button type="button" className="active" aria-current="page">
          <span>♥</span><small>Salvos</small>
        </button>
      </nav>
    </main>
  );
}

export default SavedEvents;
