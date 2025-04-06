import { loadHeaderFooter } from "./utils.js";
import { renderPokemonCards } from "./card.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderPokemonCards();
});