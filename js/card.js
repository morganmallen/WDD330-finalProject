import { showPokemonSidebar } from "./sidebar.js";
import { createStarElement } from "./favorites.js";

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function getPokemonList() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();
  return data.results;
}

export async function getPokemonDetails(url) {
  const res = await fetch(url);
  return await res.json();
}

export async function renderPokemonCards() {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = '<div class="loading">Loading Pokémon...</div>';

  try {
    const list = await getPokemonList();
    pokedex.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (const pokemon of list) {
      const details = await getPokemonDetails(pokemon.url);
      const card = createPokemonCard(details);
      fragment.appendChild(card);
    }

    pokedex.appendChild(fragment);
  } catch (error) {
    pokedex.innerHTML = `<div class="error">Error loading Pokémon: ${error.message}</div>`;
  }
}

export function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";

  const title = document.createElement("h2");
  title.textContent = pokemon.name;

  cardHeader.appendChild(title);
  cardHeader.appendChild(createStarElement(pokemon));

  const content = document.createElement("div");
  content.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p>Type: ${pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}</p>
  `;

  card.appendChild(cardHeader);
  card.appendChild(content);

  card.addEventListener("click", () => {
    showPokemonSidebar(pokemon);
  });

  return card;
}
