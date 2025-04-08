import { loadHeaderFooter } from "../js/utils.js";
import { createPokemonCard } from "../js/card.js";
import { initSidebar } from "../js/sidebar.js";
import { getFavorites } from "../js/favorites.js";

async function initFavoritesPage() {
  await loadHeaderFooter();
  initSidebar();
  renderFavorites();
}

async function renderFavorites() {
  const container = document.getElementById("favorites-container");
  container.innerHTML = '<div class="loading">Loading favorites...</div>';

  const favorites = getFavorites();

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="no-favorites">
        <p>You don't have any favorite Pokémon yet.</p>
        <p>Go to the <a href="../index.html">Pokédex</a> and click the star on Pokémon you like!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  for (const favorite of favorites) {
    try {
      const pokemon = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${favorite.id}`
      ).then((res) => res.json());
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    } catch (error) {
      console.error(`Error loading favorite Pokémon ${favorite.name}:`, error);
    }
  }

  container.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", initFavoritesPage);
