import {
  createPokemonCard,
  getPokemonList,
  getPokemonDetails,
} from "./card.js";

//sets up event listeners for the search form
export function initSearch() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const searchTerm = searchInput.value.trim().toLowerCase();

      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        resetSearch();
      }
    });

    let debounceTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);

      if (e.target.value === "") {
        resetSearch();
      } else if (e.target.value.length >= 2) {
        debounceTimeout = setTimeout(() => {
          performSearch(e.target.value.trim().toLowerCase());
        }, 300);
      }
    });
  }
}

// searches for pokemon based on the inputted name
async function performSearch(searchTerm) {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = '<div class="loading">Searching for Pokémon...</div>';

  try {
    const pokemonList = await getPokemonList();

    const filteredList = pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );

    if (filteredList.length === 0) {
      pokedex.innerHTML = `<div class="no-results">No Pokémon found matching "${searchTerm}"</div>`;
      return;
    }

    pokedex.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const pokemonDetailsPromises = filteredList.map((pokemon) =>
      getPokemonDetails(pokemon.url)
    );

    const pokemonDetails = await Promise.all(pokemonDetailsPromises);

    pokemonDetails.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    });

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error searching Pokémon: ${error.message}</div>`;
  }
}

//resets the search bar and displays all pokemon
async function resetSearch() {
  const { renderPokemonCards } = await import("./card.js");
  renderPokemonCards(1);
}
