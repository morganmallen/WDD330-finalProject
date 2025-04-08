import { loadHeaderFooter } from "./utils.js";
import { renderPokemonCards } from "./card.js";
import { initSidebar } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderPokemonCards();
  initSidebar();
});