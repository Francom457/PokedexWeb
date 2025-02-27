document.getElementById('searchButton').addEventListener('click', () => {
  const pokemonName = document.getElementById('pokemonSearch').value.toLowerCase();
  window.location.href = `pokemon.html?pokemon=${pokemonName}`;
});

function getPokemonFromURL() {
  return new URLSearchParams(window.location.search).get('pokemon');
}

document.addEventListener('DOMContentLoaded', () => {
  const pokemonName = getPokemonFromURL();
  if (pokemonName) window.location.href = `pokemon.html?pokemon=${pokemonName}`;

  fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
    .then(response => response.json())
    .then(data => pokemonNames = data.results.map(pokemon => pokemon.name))
    .catch(error => console.error('Error al cargar la lista de Pokémon:', error));
});

const searchInput = document.getElementById('pokemonSearch');
const autocompleteList = document.getElementById('autocomplete-list');
let pokemonNames = [];

fetch('https://pokeapi.co/api/v2/pokemon?limit=5000')
  .then(response => response.json())
  .then(data => pokemonNames = data.results.map(pokemon => pokemon.name))
  .catch(error => console.error('Error fetching Pokémon list:', error));

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  autocompleteList.innerHTML = '';

  if (query) {
    const filteredNames = pokemonNames.filter(name => name.startsWith(query));
    filteredNames.forEach(name => {
      const item = document.createElement('div');
      item.textContent = name;
      item.addEventListener('click', () => {
        searchInput.value = name;
        autocompleteList.innerHTML = '';
        searchInput.style.borderRadius = '50px';
        searchInput.style.borderBottom = '2px solid #333';
      });
      autocompleteList.appendChild(item);
    });
    autocompleteList.style.display = 'block';
    autocompleteList.style.width = `${searchInput.offsetWidth - 4}px`;
    autocompleteList.style.top = `${searchInput.offsetTop + searchInput.offsetHeight}px`;
    autocompleteList.style.left = `${searchInput.offsetLeft}px`;
    searchInput.style.borderRadius = '50px 50px 0 0';
    searchInput.style.borderBottom = 'none';
  } else {
    autocompleteList.style.display = 'none';
    searchInput.style.borderRadius = '50px';
    searchInput.style.borderBottom = '2px solid #333';
  }
});

document.addEventListener('click', (event) => {
  if (!searchInput.contains(event.target) && !autocompleteList.contains(event.target)) {
    autocompleteList.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const pokemonName = getPokemonFromURL();
  if (pokemonName) fetchPokemonData(pokemonName);

  loadPokedex();

  document.getElementById('type-filter').addEventListener('change', loadPokedex);
  document.getElementById('generation-filter').addEventListener('change', loadPokedex);
});

let currentOffset = 0;
const limit = 10;
let pokemonList = [];

function loadPokedex() {
  const typeFilter = document.getElementById('type-filter').value;
  const generationFilter = document.getElementById('generation-filter').value;
  let url = 'https://pokeapi.co/api/v2/pokemon?limit=1000';

  if (generationFilter) url = `https://pokeapi.co/api/v2/generation/${generationFilter}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const pokedexGrid = document.getElementById('pokedex-grid');
      pokedexGrid.innerHTML = '';
      currentOffset = 0;

      pokemonList = generationFilter ? data.pokemon_species : data.results;

      if (generationFilter) {
        pokemonList.sort((a, b) => parseInt(a.url.split('/').slice(-2, -1)[0]) - parseInt(b.url.split('/').slice(-2, -1)[0]));
      }

      if (typeFilter) {
        fetch(`https://pokeapi.co/api/v2/type/${typeFilter}`)
          .then(response => response.json())
          .then(typeData => {
            const typePokemonNames = typeData.pokemon.map(p => p.pokemon.name);
            pokemonList = pokemonList.filter(p => typePokemonNames.includes(p.name));
            pokemonList.sort((a, b) => parseInt(a.url.split('/').slice(-2, -1)[0]) - parseInt(b.url.split('/').slice(-2, -1)[0]));
            displayPokemonBatch();
          })
          .catch(error => console.error('Error fetching Pokémon by type:', error));
      } else {
        pokemonList.sort((a, b) => parseInt(a.url.split('/').slice(-2, -1)[0]) - parseInt(b.url.split('/').slice(-2, -1)[0]));
        displayPokemonBatch();
      }
    })
    .catch(error => console.error('Error al cargar la Pokédex:', error));
}

function handleMouseMove(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function handleMouseLeave(event) {
  event.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg)';
}

function displayPokemonBatch() {
  const pokedexGrid = document.getElementById('pokedex-grid');
  const end = currentOffset + limit;
  const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];

  pokemonList.slice(currentOffset, end).forEach(pokemon => {
    const pokemonUrl = pokemon.url.replace('pokemon-species', 'pokemon');

    fetch(pokemonUrl)
      .then(response => response.json())
      .then(pokemonData => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const favButton = document.createElement('button');
        favButton.className = `favorite-star ${favorites.includes(pokemonData.name) ? 'active' : 'inactive'}`;
        favButton.innerHTML = favorites.includes(pokemonData.name) ? '❤️' : '🖤';
        favButton.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFavorite(pokemonData.name, favButton);
        });
        card.appendChild(favButton);

        const number = document.createElement('p');
        number.textContent = `#${pokemonData.id.toString().padStart(3, '0')}`;
        card.appendChild(number);

        const img = document.createElement('img');
        img.src = pokemonData.sprites.front_default;
        img.alt = pokemon.name;
        card.appendChild(img);

        const name = document.createElement('p');
        name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        card.appendChild(name);

        const typeContainer = document.createElement('div');
        typeContainer.className = 'pokemon-types';
        pokemonData.types.forEach(typeInfo => {
          const typeName = typeInfo.type.name;
          const typeIcon = document.createElement('img');
          typeIcon.src = `https://pokemon-project.com/leyendasarceus/img/tipos/${typeName.charAt(0).toUpperCase() + typeName.slice(1)}.png`;
          typeIcon.alt = typeName;
          typeIcon.className = `type-icon type-${typeName}`;
          typeContainer.appendChild(typeIcon);
        });
        card.appendChild(typeContainer);

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        card.addEventListener('click', () => {
          window.location.href = `pokemon.html?pokemon=${pokemonData.name}`;
        });

        pokedexGrid.appendChild(card);
      })
      .catch(error => console.error('Error al cargar el sprite del Pokémon:', error));
  });

  currentOffset = end;
  document.getElementById('load-more').style.display = currentOffset >= pokemonList.length ? 'none' : 'block';
}

function toggleFavorite(pokemonName, button) {
  const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
  const isFavorite = favorites.includes(pokemonName);

  if (isFavorite) {
    const index = favorites.indexOf(pokemonName);
    favorites.splice(index, 1);
    button.innerHTML = '🖤';
    button.classList.replace('active', 'inactive');
    Swal.fire({
      title: 'Eliminado de favoritos',
      text: `${pokemonName} ha sido eliminado de tu lista`,
      icon: 'info',
      background: 'rgba(0, 0, 0, 0.5)',
      color: '#ffde00',
      confirmButtonColor: '#3b4cca',
      customClass: {
        popup: 'swal-custom-popup',
        icon: 'swal-custom-icon'
      }
    });
  } else {
    favorites.push(pokemonName);
    button.innerHTML = '❤️';
    button.classList.replace('inactive', 'active');
    Swal.fire({
      title: '¡Añadido a favoritos!',
      text: `${pokemonName} ha sido añadido a tu lista`,
      icon: 'success',
      background: 'rgba(0, 0, 0, 0.5)',
      color: '#ffde00',
      confirmButtonColor: '#3b4cca',
      customClass: {
        popup: 'swal-custom-popup',
        icon: 'swal-custom-icon'
      }
    });
  }

  localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

document.getElementById('load-more').addEventListener('click', displayPokemonBatch);