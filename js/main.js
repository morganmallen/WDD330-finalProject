import { loadHeaderFooter } from "./utils.js";
import { renderPokemonCards } from "./card.js";
import { initSearch } from "./search.js";
import { initFilters } from "./filter.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderPokemonCards();
  initSearch();
  initFilters();
});
