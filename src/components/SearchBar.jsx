function SearchBar({
  searchTerm,
  onSearchChange,
}) {
  return (
    <div className="search-container">

      <span className="search-icon">
        🔎
      </span>

      <input
        type="text"
        placeholder="Buscar local ou evento..."
        value={searchTerm}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
      />

    </div>
  );
}

export default SearchBar;