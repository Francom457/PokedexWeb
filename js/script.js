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
let loadedPokemonIds = new Set();


let currentTypeFilter = '';
let currentGenFilter = '';

function loadPokedex() {
  let url = 'https://pokeapi.co/api/v2/pokemon?limit=1000';

  if (currentGenFilter) {
    url = `https://pokeapi.co/api/v2/generation/${currentGenFilter}`;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const pokedexGrid = document.getElementById('pokedex-grid');
      pokedexGrid.innerHTML = '';
      currentOffset = 0;
      loadedPokemonIds.clear();

      pokemonList = currentGenFilter ? data.pokemon_species : data.results;

      if (currentGenFilter) {
        pokemonList.sort((a, b) => parseInt(a.url.split('/').slice(-2, -1)[0]) - parseInt(b.url.split('/').slice(-2, -1)[0]));
      }

      if (currentTypeFilter) {
        fetch(`https://pokeapi.co/api/v2/type/${currentTypeFilter}`)
          .then(response => response.json())
          .then(typeData => {
            const typePokemonNames = typeData.pokemon.map(p => p.pokemon.name);
            pokemonList = pokemonList.filter(p => typePokemonNames.includes(p.name));
            displayPokemonBatch();
          })
          .catch(error => console.error('Error fetching Pokémon by type:', error));
      } else {
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

  const displayPromises = pokemonList.slice(currentOffset, end).map(pokemon => {
    const pokemonUrl = pokemon.url.replace('pokemon-species', 'pokemon');
    return fetch(pokemonUrl)
      .then(response => response.json())
      .then(pokemonData => {

        if (loadedPokemonIds.has(pokemonData.id)) {
          return null;
        }
        loadedPokemonIds.add(pokemonData.id);

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

        return card;
      });
  });

  Promise.all(displayPromises)
    .then(cards => {
      cards.filter(card => card !== null).forEach(card => {
        pokedexGrid.appendChild(card);
      });
      currentOffset = end;
      document.getElementById('load-more').style.display = 
        currentOffset >= pokemonList.length ? 'none' : 'block';
    });
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
      icon: 'error',
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


document.querySelectorAll('.filter-options div').forEach(option => {
  option.addEventListener('click', function() {
    const filterType = this.parentElement.closest('.collapsible').querySelector('label').textContent.includes('Tipo') ? 'type' : 'generation';
    const value = this.getAttribute('data-value');
    

    this.closest('.collapsible').querySelector('label').textContent = 
      this.textContent.length > 20 ? 
      (filterType === 'type' ? 'Filtrar por Tipo' : 'Filtrar por Generación') : 
      this.textContent;
    

    this.closest('.collapsible').querySelector('input[type="checkbox"]').checked = false;
    

    if (filterType === 'type') {
      currentTypeFilter = value;
    } else {
      currentGenerationFilter = value;
    }

    offset = 0;
    loadedPokemon = [];
    document.getElementById('pokedex-grid').innerHTML = '';
    loadPokemon();
  });
});

document.querySelectorAll('.collapsible .content a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const type = e.target.getAttribute('data-type');
    const gen = e.target.getAttribute('data-gen');
    
    if (type !== null) {
      currentTypeFilter = type;
    }
    if (gen !== null) {
      currentGenFilter = gen;
    }
    
    resetAndLoadPokemon();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const pokemonName = getPokemonFromURL();
  if (pokemonName) fetchPokemonData(pokemonName);

  loadPokedex();

  document.querySelectorAll('.collapsible .content a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const type = e.target.getAttribute('data-type');
      const gen = e.target.getAttribute('data-gen');
      
      if (type !== null) {
        currentTypeFilter = type;
        document.querySelector('label[for="type-filter-toggle"]').textContent = 
          type ? `Tipo: ${e.target.textContent}` : 'Filtrar por Tipo';
      }
      
      if (gen !== null) {
        currentGenFilter = gen;
        document.querySelector('label[for="generation-filter-toggle"]').textContent = 
          gen ? `Generación: ${e.target.textContent}` : 'Filtrar por Generación';
      }
      

      if (type !== null) {
        document.getElementById('type-filter-toggle').checked = false;
      }
      if (gen !== null) {
        document.getElementById('generation-filter-toggle').checked = false;
      }
      
      loadPokedex();
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.collapsible')) {
      document.querySelectorAll('.collapsible input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const typeButton = document.getElementById('type-filter-btn');
  const genButton = document.getElementById('gen-filter-btn');
  const typeDropdown = document.getElementById('type-dropdown');
  const genDropdown = document.getElementById('gen-dropdown');


  function toggleDropdown(button, dropdown) {
    const isActive = button.classList.contains('active');
    

    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.filter-dropdown').forEach(drop => drop.classList.remove('show'));
    
    if (!isActive) {
      button.classList.add('active');
      dropdown.classList.add('show');
    }
  }

  typeButton.addEventListener('click', () => toggleDropdown(typeButton, typeDropdown));
  genButton.addEventListener('click', () => toggleDropdown(genButton, genDropdown));

  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      const type = option.getAttribute('data-type');
      const gen = option.getAttribute('data-gen');
      
      if (type !== null) {
        currentTypeFilter = type;
        typeButton.querySelector('span').textContent = type ? `Tipo: ${option.textContent}` : 'Filtrar por Tipo';
      }
      
      if (gen !== null) {
        currentGenFilter = gen;
        genButton.querySelector('span').textContent = gen ? `Generación: ${option.textContent}` : 'Filtrar por Generación';
      }
      

      document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown').forEach(drop => drop.classList.remove('show'));

      loadPokedex();
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-box')) {
      document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown').forEach(drop => drop.classList.remove('show'));
    }
  });
});