function BottomNav({ telaAtual, onNavigate }) {
  const navItems = [
    { id: "explorar", label: "Explorar", icon: "⌂" },
    { id: "mapa", label: "Mapa", icon: "⌖" },
    { id: "salvos", label: "Salvos", icon: "♡", activeIcon: "♥" },
    { id: "agenda", label: "Agenda", icon: "▦" },
    { id: "perfil", label: "Perfil", icon: "♙" },
  ];

  return (
    <nav className="bottom-navigation unified-navigation" aria-label="Navegação principal">
      {navItems.map((item) => {
        const isActive =
          telaAtual === item.id ||
          (item.id === "agenda" && telaAtual === "catalogo");

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span>{isActive && item.activeIcon ? item.activeIcon : item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;