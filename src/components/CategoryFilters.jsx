import categoryConfig from "../utils/categoryConfig";

const categories = [
  {
    id: "todos",
    label: "Todos",
    icon: "📍",
  },
  {
    id: "musica",
    label: "Música",
    icon: "🎵",
  },
  {
    id: "arte",
    label: "Arte",
    icon: "🎨",
  },
  {
    id: "teatro",
    label: "Teatro",
    icon: "🎭",
  },
  {
    id: "cinema",
    label: "Cinema",
    icon: "🎬",
  },
  {
    id: "biblioteca",
    label: "Bibliotecas",
    icon: "📚",
  },
  {
    id: "centro-cultural",
    label: "Centros culturais",
    icon: "🏛️",
  },
  {
    id: "turismo-cultural",
    label: "Turismo cultural",
    icon: "📍",
  },
];

function CategoryFilters({
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="filters-container">

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`filter-button ${
            selectedCategory === category.id
              ? "active"
              : ""
          }`}
          onClick={() =>
            onCategoryChange(category.id)
          }
        >
          {category.icon} {category.label}
        </button>
      ))}

    </div>
  );
}

export default CategoryFilters;