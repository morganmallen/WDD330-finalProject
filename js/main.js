import { loadHeaderFooter } from "./utils.js";
import { renderPokemonCards } from "./card.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderPokemonCards();

  const backdrop = document.getElementById("sidebar-backdrop");
const sidebar = document.getElementById("sidebar");

document.getElementById("closeSidebar").addEventListener("click", () => {
  sidebar.classList.remove("show");
  sidebar.classList.add("hidden");
  backdrop.classList.remove("show");
  backdrop.classList.add("hidden");
});

backdrop.addEventListener("click", () => {
  sidebar.classList.remove("show");
  sidebar.classList.add("hidden");
  backdrop.classList.remove("show");
  backdrop.classList.add("hidden");
});
});
