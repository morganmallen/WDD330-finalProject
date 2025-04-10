import { showPokemonSidebar } from "./sidebar.js";
import { createStarElement } from "./favorites.js";

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const CACHE_KEY = "pokemon-cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
const MAX_CACHE_ITEMS = 50;

export async function getPokemonList() {
  const cachedData = getFromCache("pokemon-list");

  if (cachedData) {
    return cachedData;
  }

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();

  try {
    saveToCache("pokemon-list", data.results);
  } catch (error) {
    console.warn("Could not cache Pokémon list:", error);
  }

  return data.results;
}

export async function getPokemonDetails(url) {
  const cacheKey = `pokemon-${url.split("/").filter(Boolean).pop()}`;

  const cachedPokemon = getFromCache(cacheKey);

  if (cachedPokemon) {
    return cachedPokemon;
  }

  const res = await fetch(url);
  const data = await res.json();

  const essentialData = {
    id: data.id,
    name: data.name,
    types: data.types,
    stats: data.stats,
    sprites: {
      front_default: data.sprites.front_default,
    },
    height: data.height,
    weight: data.weight,
  };

  try {
    saveToCache(cacheKey, essentialData);
  } catch (error) {
    console.warn(`Could not cache Pokémon ${data.name}:`, error);
    clearOldestCacheItems();
  }

  return data;
}

function clearOldestCacheItems() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key.startsWith("pokemon-") &&
        key !== "pokemon-list" &&
        key !== "pokemon-favorites"
      ) {
        keys.push({
          key: key,
          timestamp: JSON.parse(localStorage.getItem(key)).timestamp,
        });
      }
    }

    keys.sort((a, b) => a.timestamp - b.timestamp);

    const removeCount = Math.ceil(keys.length * 0.2);
    for (let i = 0; i < removeCount && i < keys.length; i++) {
      localStorage.removeItem(keys[i].key);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    const favoritesData = localStorage.getItem("pokemon-favorites");
    localStorage.clear();
    if (favoritesData) {
      localStorage.setItem("pokemon-favorites", favoritesData);
    }
  }
}

function saveToCache(key, data) {
  try {
    const cacheItem = {
      data: data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    if (
      error.name === "QuotaExceededError" ||
      error.toString().includes("quota")
    ) {
      clearOldestCacheItems();
      localStorage.setItem(
        key,
        JSON.stringify({
          data: data,
          timestamp: Date.now(),
        })
      );
    } else {
      throw error;
    }
  }
}

function getFromCache(key) {
  try {
    const cacheItem = localStorage.getItem(key);

    if (!cacheItem) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cacheItem);

    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Error reading from cache:", error);
    return null;
  }
}

export async function renderPokemonCards(page = 1, itemsPerPage = 20) {
  const pokedex = document.getElementById("pokedex");

  if (page === 1) {
    pokedex.innerHTML = `
      <div class="loading">
        Loading Pokémon... 
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
      </div>`;
  }

  try {
    const list = await getPokemonList();
    const totalPages = Math.ceil(list.length / itemsPerPage);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, list.length);
    const pageItems = list.slice(startIndex, endIndex);

    if (page === 1) {
      pokedex.innerHTML = "";
    }

    const fragment = document.createDocumentFragment();
    const progressBar = document.querySelector(".progress");

    const detailPromises = pageItems.map((pokemon) =>
      getPokemonDetails(pokemon.url)
    );

    let completed = 0;
    const updateProgress = () => {
      completed++;
      if (progressBar) {
        const percentage = (completed / pageItems.length) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    };

    const pokemonDetails = await Promise.all(
      detailPromises.map((promise) =>
        promise
          .then((result) => {
            updateProgress();
            return result;
          })
          .catch((error) => {
            updateProgress();
            console.error("Error fetching Pokémon details:", error);
            return null;
          })
      )
    );

    pokemonDetails.filter(Boolean).forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    });

    pokedex.appendChild(fragment);

    if (page < totalPages) {
      const loadMoreContainer = document.createElement("div");
      loadMoreContainer.className = "load-more-container";

      const loadMoreButton = document.createElement("button");
      loadMoreButton.className = "load-more-button";
      loadMoreButton.textContent = "Load More Pokémon";
      loadMoreButton.addEventListener("click", () => {
        loadMoreButton.textContent = "Loading...";
        loadMoreButton.disabled = true;
        renderPokemonCards(page + 1, itemsPerPage);
        loadMoreContainer.remove();
      });

      loadMoreContainer.appendChild(loadMoreButton);
      pokedex.appendChild(loadMoreContainer);
    }
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
