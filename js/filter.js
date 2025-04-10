export function initFilters() {
  const filterButton = document.getElementById("filter-button");
  const filterMenu = document.getElementById("filter-menu");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const resetFiltersBtn = document.getElementById("reset-filters");

  if (filterButton && filterMenu) {
    filterButton.addEventListener("click", (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (
        filterMenu.classList.contains("show") &&
        !filterMenu.contains(e.target) &&
        e.target !== filterButton
      ) {
        filterMenu.classList.remove("show");
      }
    });
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      applyFilters();
      filterMenu.classList.remove("show");
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      resetFilters();
      filterMenu.classList.remove("show");
    });
  }
}

export async function applyFilters() {
  const statType = document.getElementById("stat-type").value;
  const comparison = document.getElementById("stat-comparison").value;
  const statValue = parseInt(document.getElementById("stat-value").value);

  const pokedex =
    document.getElementById("pokedex") ||
    document.getElementById("favorites-container");

  if (!pokedex) return;

  pokedex.innerHTML = '<div class="loading">Applying filters...</div>';

  try {
    let pokemonList;

    if (window.location.pathname.includes("favorites")) {
      const favorites = JSON.parse(
        localStorage.getItem("pokemon-favorites") || "[]"
      );

      const detailedFavorites = await Promise.all(
        favorites.map((fav) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${fav.id}`).then((res) =>
            res.json()
          )
        )
      );

      pokemonList = detailedFavorites;
    } else {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=151"
      );
      const data = await response.json();

      pokemonList = await Promise.all(
        data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        )
      );
    }

    if (statValue && !isNaN(statValue)) {
      pokemonList = pokemonList.filter((pokemon) => {
        let statIndex;
        switch (statType) {
          case "hp":
            statIndex = 0;
            break;
          case "attack":
            statIndex = 1;
            break;
          case "defense":
            statIndex = 2;
            break;
            case "special attack":
            statIndex = 3;
            break;
            case "special defense":
            statIndex = 4;
            break;
          case "speed":
            statIndex = 5;
            break;
          default:
            statIndex = 0;
        }

        const pokemonStatValue = pokemon.stats[statIndex].base_stat;

        return comparison === "greater"
          ? pokemonStatValue > statValue
          : pokemonStatValue < statValue;
      });
    }

    pokedex.innerHTML = "";

    if (pokemonList.length === 0) {
      pokedex.innerHTML =
        '<div class="no-results">No Pokémon match your filters</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    const { createPokemonCard } = await import("./card.js");

    for (const pokemon of pokemonList) {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    }

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error applying filters: ${error.message}</div>`;
  }
}

export function resetFilters() {
  document.getElementById("stat-type").value = "hp";
  document.getElementById("stat-comparison").value = "greater";
  document.getElementById("stat-value").value = "50";

  if (!window.location.pathname.includes("favorites")) {
    import("./card.js").then((module) => {
      module.renderPokemonCards();
    });
  } else {
    import("./favoritesPage.js").then((module) => {
      module.renderFavorites();
    });
  }
}
