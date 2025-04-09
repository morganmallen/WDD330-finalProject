import { createPokemonCard } from "./card.js";
import { getPokemonList, getPokemonDetails } from "./card.js";

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

    searchInput.addEventListener("input", (e) => {
      if (e.target.value === "") {
        resetSearch();
      }
    });
  }
}

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

    for (const pokemon of filteredList) {
      const details = await getPokemonDetails(pokemon.url);
      const card = createPokemonCard(details);
      fragment.appendChild(card);
    }

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error searching Pokémon: ${error.message}</div>`;
  }
}

async function resetSearch() {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = '<div class="loading">Loading all Pokémon...</div>';

  try {
    const pokemonList = await getPokemonList();

    pokedex.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (const pokemon of pokemonList) {
      const details = await getPokemonDetails(pokemon.url);
      const card = createPokemonCard(details);
      fragment.appendChild(card);
    }

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error loading Pokémon: ${error.message}</div>`;
  }
}
