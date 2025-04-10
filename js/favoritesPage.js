import { loadHeaderFooter } from "../js/utils.js";
import { createPokemonCard } from "../js/card.js";
import { initSidebar } from "../js/sidebar.js";
import { getFavorites } from "../js/favorites.js";
import { initFilters } from "./filter.js";

async function initFavoritesPage() {
  await loadHeaderFooter();
  initSidebar();
  renderFavorites();
  initFilters();
}

async function renderFavorites() {
  const container = document.getElementById("favorites-container");
  container.innerHTML = `
    <div class="loading">
      Loading favorites... 
      <div class="progress-bar">
        <div class="progress" style="width: 0%"></div>
      </div>
    </div>`;

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

  try {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const progressBar = document.querySelector(".progress");

    // Create a cache key for each favorite Pokémon
    const pokemonPromises = favorites.map((favorite) => {
      const cacheKey = `pokemon-${favorite.id}`;
      let cachedData = null;

      try {
        cachedData = localStorage.getItem(cacheKey);
      } catch (error) {
        console.warn("Error accessing localStorage:", error);
      }

      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // Check if cache is still valid (24 hours)
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            return Promise.resolve(data);
          }
        } catch (error) {
          console.warn("Error parsing cached data:", error);
        }
      }

      // Fetch if not in cache
      return fetch(`https://pokeapi.co/api/v2/pokemon/${favorite.id}`)
        .then((res) => res.json())
        .then((data) => {
          // Only store essential data
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

          // Try to cache, but continue if it fails
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: essentialData,
                timestamp: Date.now(),
              })
            );
          } catch (error) {
            console.warn(`Could not cache Pokémon ${data.name}:`, error);
            // No need to clear cache here as we're only loading favorites
          }

          return data;
        });
    });

    // Track progress
    let completed = 0;
    const updateProgress = () => {
      completed++;
      if (progressBar) {
        const percentage = (completed / favorites.length) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    };

    // Process details as they resolve
    const pokemonDetails = await Promise.all(
      pokemonPromises.map((promise) =>
        promise
          .then((result) => {
            updateProgress();
            return result;
          })
          .catch((error) => {
            updateProgress();
            console.error("Error fetching favorite Pokémon:", error);
            return null; // Return null for failed requests
          })
      )
    );

    // Create cards for each favorite Pokémon (filter out nulls from failed requests)
    pokemonDetails.filter(Boolean).forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);

    if (pokemonDetails.filter(Boolean).length === 0) {
      container.innerHTML = `
        <div class="error">
          Failed to load any favorites. Please try refreshing the page.
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `<div class="error">Error loading favorite Pokémon: ${error.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initFavoritesPage);
