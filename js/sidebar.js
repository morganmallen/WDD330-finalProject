import { createStarElement } from "./favorites.js";

export function showPokemonSidebar(pokemon) {
  const sidebar = document.getElementById("sidebar");
  const sidebarContent = document.getElementById("sidebarContent");

  const pokemonName = capitalize(pokemon.name);

  const header = document.createElement("div");
  header.className = "sidebar-header";

  const title = document.createElement("h2");
  title.textContent = pokemonName;

  header.appendChild(title);

  sidebarContent.innerHTML = "";
  sidebarContent.appendChild(header);

  const details = document.createElement("div");
  details.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p><strong>Types:</strong> ${pokemon.types
      .map((t) => capitalize(t.type.name))
      .join(", ")}</p>
    <p><strong>HP:</strong> ${pokemon.stats[0].base_stat}</p>
    <p><strong>Attack:</strong> ${pokemon.stats[1].base_stat}</p>
    <p><strong>Defense:</strong> ${pokemon.stats[2].base_stat}</p>
    <p><strong>Special Attack:</strong> ${pokemon.stats[3].base_stat}</p>
    <p><strong>Special Defense:</strong> ${pokemon.stats[4].base_stat}</p>
    <p><strong>Speed:</strong> ${pokemon.stats[5].base_stat}</p>
  `;

  sidebarContent.appendChild(details);

  showBackdrop();

  sidebar.classList.remove("hidden");
  void sidebar.offsetWidth;
  sidebar.classList.add("show");

  console.log(pokemon);
}

export function initSidebar() {
  const sidebar = document.getElementById("sidebar");

  document.getElementById("closeSidebar").addEventListener("click", () => {
    closeSidebar();
  });

  if (!document.getElementById("sidebar-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    document.body.appendChild(backdrop);
  }

  document.getElementById("sidebar-backdrop").addEventListener("click", () => {
    closeSidebar();
  });
}

function showBackdrop() {
  const backdrop = document.getElementById("sidebar-backdrop");
  backdrop.classList.add("active");
}

export function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");

  sidebar.classList.remove("show");
  backdrop.classList.remove("active");

  setTimeout(() => {
    if (!sidebar.classList.contains("show")) {
      sidebar.classList.add("hidden");
    }
  }, 300);
}

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}
