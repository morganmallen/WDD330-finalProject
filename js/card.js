function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function getPokemonList() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();
  return data.results; // Array of { name, url }
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
    pokedex.innerHTML = ""; // Clear loading message

    // Create a document fragment to improve performance
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

  card.innerHTML = `
    <h2>${pokemon.name}</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p>Type: ${pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}</p>
  `;

  card.addEventListener("click", () => {
    showPokemonSidebar(pokemon);
  });

  return card;
}

function showPokemonSidebar(pokemon) {
  const sidebar = document.getElementById("sidebar");
  const sidebarContent = document.getElementById("sidebarContent");

  sidebarContent.innerHTML = `
    <h2>${capitalize(pokemon.name)}</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p><strong>Types:</strong> ${pokemon.types
      .map((t) => capitalize(t.type.name))
      .join(", ")}</p>
    <p><strong>HP:</strong> ${pokemon.stats[0].base_stat}</p>
    <p><strong>Attack:</strong> ${pokemon.stats[1].base_stat}</p>
    <p><strong>Defense:</strong> ${pokemon.stats[2].base_stat}</p>
    <p><strong>Speed:</strong> ${pokemon.stats[5].base_stat}</p>
  `;

  sidebar.classList.add("show");
  sidebar.classList.remove("hidden");
}
