// sets up the event listeners for the filter menu
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

// applies the selected filter to the current Pokemon list
export async function applyFilters() {
  const statType = document.getElementById("stat-type").value;
  const comparison = document.getElementById("stat-comparison").value;
  const statValue = parseInt(document.getElementById("stat-value").value);

  //checks if on the home or favorites page
  const pokedex =
    document.getElementById("pokedex") ||
    document.getElementById("favorites-container");

  if (!pokedex) return;

  pokedex.innerHTML = '<div class="loading">Applying filters...</div>';

  try {
    let pokemonList = [];
    const { getPokemonList, getPokemonDetails } = await import("./card.js");

    if (window.location.pathname.includes("favorites")) {
      const favorites = JSON.parse(
        localStorage.getItem("pokemon-favorites") || "[]"
      );

      const detailedFavorites = await Promise.all(
        favorites.map((fav) => {
          const cacheKey = `pokemon-${fav.id}`;
          const cached = localStorage.getItem(cacheKey);

          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
              return Promise.resolve(data);
            }
          }

          return fetch(`https://pokeapi.co/api/v2/pokemon/${fav.id}`)
            .then((res) => res.json())
            .then((data) => {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  data,
                  timestamp: Date.now(),
                })
              );
              return data;
            });
        })
      );

      pokemonList = detailedFavorites;
    } else {
      const allPokemon = await getPokemonList();

      const allDetails = await Promise.all(
        allPokemon.map((pokemon) => getPokemonDetails(pokemon.url))
      );

      pokemonList = allDetails;
    }

    //filters the pokemon depending on the stat
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
          case "special-attack":
            statIndex = 3;
            break;
          case "special-defense":
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

    pokemonList.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    });

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error applying filters: ${error.message}</div>`;
  }
}

//resets the filter to the default display
export function resetFilters() {
  document.getElementById("stat-type").value = "hp";
  document.getElementById("stat-comparison").value = "greater";
  document.getElementById("stat-value").value = "50";

  if (!window.location.pathname.includes("favorites")) {
    import("./card.js").then((module) => {
      module.renderPokemonCards(1);
    });
  } else {
    import("./favoritesPage.js").then((module) => {
      module.renderFavorites();
    });
  }
}
