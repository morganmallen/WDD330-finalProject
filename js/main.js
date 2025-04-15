import { loadHeaderFooter } from "./utils.js";
import { renderPokemonCards } from "./card.js";
import { initSearch } from "./search.js";
import { initFilters } from "./filter.js";

//renders the main page with the header, footer, pokemon cards, search bar, and filter.
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderPokemonCards();
  initSearch();
  initFilters();
});
