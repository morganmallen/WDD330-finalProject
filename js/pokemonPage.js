import { loadHeaderFooter } from "../js/utils.js";
import { createStarElement } from "../js/favorites.js";

async function initPokemonPage() {
  await loadHeaderFooter();
  await loadPokemonDetails();
  initFilters();
}

async function loadPokemonDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonId = urlParams.get("id");

  if (!pokemonId) {
    displayError("No Pokémon ID provided");
    return;
  }

  const contentArea = document.querySelector("main");
  if (!contentArea) {
    console.error("Main content area not found");
    return;
  }

  contentArea.innerHTML = `
    <h1 class="page-title">Loading...</h1>
    <div class="loading">
      Loading Pokémon details... 
      <div class="progress-bar">
        <div class="progress" style="width: 0%"></div>
      </div>
    </div>`;

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon not found (${response.status})`);
    }

    const pokemon = await response.json();
    console.log(pokemon);

    try {
      const cacheKey = `pokemon-${pokemon.id}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: {
            id: pokemon.id,
            name: pokemon.name,
            types: pokemon.types,
            stats: pokemon.stats,
            sprites: {
              front_default: pokemon.sprites.front_default,
            },
            height: pokemon.height,
            weight: pokemon.weight,
            abilities: pokemon.abilities,
          },
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn(`Could not cache Pokémon ${pokemon.name}:`, error);
    }

    renderPokemonDetails(pokemon, contentArea);
  } catch (error) {
    displayError(`Error loading Pokémon: ${error.message}`);
  }
}

function renderPokemonDetails(pokemon, container) {
  const pageTitle = document.querySelector(".page-title");
  if (pageTitle) {
    pageTitle.textContent = capitalize(pokemon.name);
  } else {
    const titleElement = document.createElement("h1");
    titleElement.className = "page-title";
    titleElement.textContent = capitalize(pokemon.name);
    container.insertBefore(titleElement, container.firstChild);
  }

  const pokemonDetails = document.createElement("div");
  pokemonDetails.className = "pokemon-details";

  const headerSection = document.createElement("div");
  headerSection.className = "pokemon-header";

  const nameContainer = document.createElement("div");
  nameContainer.className = "pokemon-name-container";

  const pokemonId = document.createElement("span");
  pokemonId.className = "pokemon-id";
  pokemonId.textContent = `#${pokemon.id.toString().padStart(3, "0")}`;

  nameContainer.appendChild(pokemonId);
  nameContainer.appendChild(createStarElement(pokemon));

  headerSection.appendChild(nameContainer);

  const imageSection = document.createElement("div");
  imageSection.className = "pokemon-image-container";
  imageSection.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-image">
  `;

  const abilitySection = document.createElement("div");
  abilitySection.className = "pokemon-abilities";
  abilitySection.innerHTML = `
    <h3>Abilities</h3>
    <div>
      ${pokemon.abilities
        .map(
          (ability) =>
            `<span class="type-badge ${
              ability.is_hidden ? "hidden-ability" : ""
            }">${capitalize(ability.ability.name.replace("-", " "))}${
              ability.is_hidden ? " (Hidden)" : ""
            }</span>`
        )
        .join("")}
    </div>
  `;

  const typeSection = document.createElement("div");
  typeSection.className = "pokemon-types";
  typeSection.innerHTML = `
    <h3>Types</h3>
    <div class="type-badges">
      ${pokemon.types
        .map(
          (t) =>
            `<span class="type-badge ${t.type.name}">${capitalize(
              t.type.name
            )}</span>`
        )
        .join("")}
    </div>
  `;

  const statsSection = document.createElement("div");
  statsSection.className = "pokemon-stats";
  statsSection.innerHTML = `
    <h3>Base Stats</h3>
    <div class="stats-grid">
      ${pokemon.stats
        .map(
          (stat) => `
        <div class="stat-item">
          <span class="stat-name">${capitalize(
            stat.stat.name.replace("-", " ")
          )}</span>
          <div class="stat-bar-container">
            <div class="stat-bar" style="width: ${
              (stat.base_stat / 255) * 100
            }%"></div>
            <span class="stat-value">${stat.base_stat}</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  const infoSection = document.createElement("div");
  infoSection.className = "pokemon-info";
  infoSection.innerHTML = `
    <h3>Information</h3>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Height</span>
        <span class="info-value">${(pokemon.height / 10).toFixed(1)} m</span>
      </div>
      <div class="info-item">
        <span class="info-label">Weight</span>
        <span class="info-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
      </div>
    </div>
  `;

  const moveSection = document.createElement("div");
  moveSection.className = "pokemon-move";
  moveSection.innerHTML = `
    <h3>Moves</h3>
    <div class="info-grid">
        ${pokemon.moves.map(
          (move) =>
            `<div class="info-item">
                <span class="info-value">
                    ${capitalize(move.move.name)}
                </span>
            </div>`
        ).join("")}
    </div>
  `;

  const backButton = document.createElement("button");
  backButton.className = "back-button";
  backButton.textContent = "← Back to Pokédex";
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  pokemonDetails.appendChild(headerSection);
  pokemonDetails.appendChild(imageSection);
  pokemonDetails.appendChild(typeSection);
  pokemonDetails.appendChild(abilitySection);
  pokemonDetails.appendChild(statsSection);
  pokemonDetails.appendChild(infoSection);
  pokemonDetails.appendChild(moveSection);
  pokemonDetails.appendChild(backButton);

  while (container.childNodes.length > 1) {
    container.removeChild(container.lastChild);
  }
  container.appendChild(pokemonDetails);
}

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function displayError(message) {
  const contentArea = document.querySelector("main");
  if (!contentArea) return;

  contentArea.innerHTML = `
    <h1 class="page-title">Error</h1>
    <div class="error">
      ${message}
      <button class="back-button" onclick="window.history.back()">← Back to Pokédex</button>
    </div>
  `;
}

function initFilters() {
  import("../js/filter.js").then((module) => {
    module.initFilters();
  });
}

document.addEventListener("DOMContentLoaded", initPokemonPage);
