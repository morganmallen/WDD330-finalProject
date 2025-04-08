export function getFavorites() {
  const favorites = localStorage.getItem("pokemon-favorites");
  return favorites ? JSON.parse(favorites) : [];
}

export function saveFavorites(favorites) {
  localStorage.setItem("pokemon-favorites", JSON.stringify(favorites));
}

export function addToFavorites(pokemon) {
  const favorites = getFavorites();

  if (!favorites.some((fav) => fav.id === pokemon.id)) {
    favorites.push({
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprites.front_default,
      types: pokemon.types.map((t) => t.type.name),
    });

    saveFavorites(favorites);
    return true;
  }

  return false;
}

export function removeFromFavorite(pokemonId) {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter((fav) => fav.id !== pokemonId);

  saveFavorites(updatedFavorites);
  return updatedFavorites.length !== favorites.length;
}

export function isFavorite(pokemonId) {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === pokemonId);
}

export function toggleFavorite(pokemon) {
  if (isFavorite(pokemon.id)) {
    removeFromFavorite(pokemon.id);
    return false;
  } else {
    addToFavorites(pokemon);
    return true;
  }
}

export function createStarElement(pokemon, callback) {
  const starContainer = document.createElement("div");
  starContainer.className = "star-container";

  const starElement = document.createElement("span");
  starElement.className = `star ${isFavorite(pokemon.id) ? "favorite" : ""}`;
  starElement.innerHTML = isFavorite(pokemon.id) ? "★" : "☆";
  starElement.title = isFavorite(pokemon.id)
    ? "Remove from favorites"
    : "Add to favorites";

  starElement.addEventListener("click", (e) => {
    e.stopPropagation();

    const isFav = toggleFavorite(pokemon);
    starElement.innerHTML = isFav ? "★" : "☆";
    starElement.className = `star ${isFav ? "favorite" : ""}`;
    starElement.title = isFav ? "Remove from favorites" : "Add to favorites";

    if (callback) callback(isFav);
  });

  starContainer.appendChild(starElement);
  return starContainer;
}
