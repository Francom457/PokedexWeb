document.getElementById('searchButton').addEventListener('click', () => {
  const pokemonName = document.getElementById('pokemonSearch').value.toLowerCase();
  fetchPokemonData(pokemonName);
});

function getPokemonFromURL() {
  return new URLSearchParams(window.location.search).get('pokemon');
}

document.addEventListener('DOMContentLoaded', () => {
  const pokemonName = getPokemonFromURL();
  if (pokemonName) fetchPokemonData(pokemonName);
});

const typeTranslations = { 
  normal: "Normal", 
  fire: "Fuego", 
  water: "Agua", 
  grass: "Planta", 
  electric: "Eléctrico", 
  ice: "Hielo", 
  fighting: "Lucha", 
  poison: "Veneno", 
  ground: "Tierra", 
  flying: "Volador", 
  psychic: "Psíquico", 
  bug: "Bicho", 
  rock: "Roca", 
  ghost: "Fantasma", 
  dark: "Siniestro", 
  dragon: "Dragón", 
  steel: "Acero", 
  fairy: "Hada" 
};

function fetchPokemonData(pokemonName) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then(response => {
      if (!response.ok) throw new Error('Pokémon no encontrado');
      return response.json();
    })
    .then(data => {
      displayPokemon(data);
      fetchEvolutionData(data.species.url);
      fetchPokemonDescription(data.species.url);
      history.pushState(null, '', `?pokemon=${pokemonName}`);
    })
    .catch(error => {
      console.error('Error al cargar el Pokémon:', error);
      Swal.fire({
        title: "Oops...",
        titleText: "¡No se encontró el Pokémon!",
        text: "Por favor, verifica el nombre e inténtalo de nuevo.",
        imageUrl: "https://media1.tenor.com/m/lmA7VALYIAsAAAAd/sad-pikachu.gif",
        imageWidth: 416.5,
        imageHeight: 304.43,
        imageAlt: "Custom image",
        background: 'rgba(0, 0, 0, 0.5)',
        color: '#ffde00',
        confirmButtonColor: '#3b4cca',
        customClass: {
          image: 'swal-custom-image'
        }
      });
    });
}

function displayPokemon(data) {
  const pokemonNameElement = document.getElementById('pokemon-name');
  const pokemonHeightWeightElement = document.getElementById('pokemon-height-weight');
  const pokemonImageElement = document.getElementById('pokemon-img');
  const pokemonTypeElement = document.getElementById('pokemon-type');
  const evolutionContainer = document.getElementById('pokemon-evolution');

  if (!pokemonNameElement || !pokemonHeightWeightElement || !pokemonImageElement || !pokemonTypeElement || !evolutionContainer) {
    console.error('Elementos del DOM no encontrados');
    return;
  }

  const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  pokemonNameElement.textContent = `#${data.id.toString().padStart(3, '0')} ${name}`;
  pokemonHeightWeightElement.textContent = `Altura: ${data.height / 10} m, Peso: ${data.weight / 10} kg`;
  pokemonImageElement.src = data.sprites.front_default;
  pokemonTypeElement.innerHTML = '<h3>Es de Tipo</h3>';

  const typeIcons = {
    normal: "https://pokemon-project.com/leyendasarceus/img/tipos/Normal.png",
    fire: "https://pokemon-project.com/leyendasarceus/img/tipos/Fuego.png",
    water: "https://pokemon-project.com/leyendasarceus/img/tipos/Agua.png",
    grass: "https://pokemon-project.com/leyendasarceus/img/tipos/Planta.png",
    electric: "https://pokemon-project.com/leyendasarceus/img/tipos/Electrico.png",
    ice: "https://pokemon-project.com/leyendasarceus/img/tipos/Hielo.png",
    fighting: "https://pokemon-project.com/leyendasarceus/img/tipos/Lucha.png",
    poison: "https://pokemon-project.com/leyendasarceus/img/tipos/Veneno.png",
    ground: "https://pokemon-project.com/leyendasarceus/img/tipos/Tierra.png",
    flying: "https://pokemon-project.com/leyendasarceus/img/tipos/Volador.png",
    psychic: "https://pokemon-project.com/leyendasarceus/img/tipos/Psiquico.png",
    bug: "https://pokemon-project.com/leyendasarceus/img/tipos/Bicho.png",
    rock: "https://pokemon-project.com/leyendasarceus/img/tipos/Roca.png",
    ghost: "https://pokemon-project.com/leyendasarceus/img/tipos/Fantasma.png",
    dark: "https://pokemon-project.com/leyendasarceus/img/tipos/Siniestro.png",
    dragon: "https://pokemon-project.com/leyendasarceus/img/tipos/Dragon.png",
    steel: "https://pokemon-project.com/leyendasarceus/img/tipos/Acero.png",
    fairy: "https://pokemon-project.com/leyendasarceus/img/tipos/Hada.png"
  };

  data.types.forEach(typeInfo => {
    const typeName = typeInfo.type.name;
    const translatedType = typeTranslations[typeName] || typeName;
    const typeIcon = document.createElement('img');
    typeIcon.src = typeIcons[typeName];
    typeIcon.alt = translatedType;
    typeIcon.className = `type-icon type-${typeName}`;
    pokemonTypeElement.appendChild(typeIcon);
    pokemonTypeElement.appendChild(document.createTextNode(' '));
  });

  const statsContainer = document.querySelector('.stats');
  statsContainer.innerHTML = `
    <h4>Estadísticas</h4>
    <canvas id="pokemonRadar"></canvas>
  `;

  const stats = data.stats.map(stat => stat.base_stat);
  const labels = ["HP", "Ataque", "Defensa", "Ataque Esp.", "Defensa Esp.", "Velocidad"];

  const ctx = document.getElementById('pokemonRadar').getContext('2d');
  if (window.pokemonChart) {
    window.pokemonChart.destroy();
  }
  window.pokemonChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: data.name.toUpperCase(),
        data: stats,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 255
        }
      }
    }
  });

  const imageUrl = `https://www.pkparaiso.com/imagenes/espada_escudo/sprites/animados-gigante/${data.name.toLowerCase()}.gif`;
  pokemonImageElement.src = imageUrl;
  pokemonImageElement.alt = `Animación de ${name}`;

  pokemonImageElement.onerror = () => {
    pokemonImageElement.src = data.sprites.other['official-artwork'].front_default;
    console.warn(`No se encontró un sprite animado para ${name}. Usando fallback.`);
  };

  if (data.species.url) {
    fetchEvolutionData(data.species.url);
  } else {
    evolutionContainer.style.display = 'none';
  }

  displayPokemonMoves(data.moves);
  displayError(false);
  addFavoriteButton(data.name);
}

function displayPokemonMoves(moves) {
  const movesList = document.getElementById('moves-list');
  movesList.innerHTML = '';

  moves.forEach(move => {
    fetch(move.move.url)
      .then(response => response.json())
      .then(moveData => {
        const spanishNameEntry = moveData.names.find(name => name.language.name === 'es');
        const spanishName = spanishNameEntry ? spanishNameEntry.name : moveData.name;
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.justifyContent = 'space-between';
        listItem.style.backgroundColor = getTypeColor(moveData.type.name);
        listItem.style.color = '#fff';
        listItem.style.padding = '5px';
        listItem.style.borderRadius = '5px';
        listItem.style.marginBottom = '5px';
        listItem.style.width = 'auto';

        const moveName = document.createElement('span');
        moveName.textContent = spanishName.charAt(0).toUpperCase() + spanishName.slice(1);
        listItem.appendChild(moveName);

        const moveType = moveData.type.name;
        const typeIcon = document.createElement('img');
        typeIcon.src = `https://pokemon-project.com/leyendasarceus/img/tipos/${moveType.charAt(0).toUpperCase() + moveType.slice(1)}.png`;
        typeIcon.alt = moveType;
        typeIcon.className = `type-icon type-${moveType}`;
        typeIcon.style.marginLeft = '10px';
        listItem.appendChild(typeIcon);

        movesList.appendChild(listItem);
      })
      .catch(error => console.error('Error fetching move data:', error));
  });
}

function getTypeColor(type) {
  const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
  };
  return typeColors[type] || '#777';
}

function displayEvolutionChain(chain) {
  const evolutionContainer = document.getElementById('pokemon-evolution');

  if (!chain || !chain.species || !chain.evolves_to || chain.evolves_to.length === 0) {
    evolutionContainer.innerText = 'Evolución: Ninguna';
    return;
  }

  let evolutions = [];
  let current = chain;

  while (current) {
    if (current.species.name === chain.species.name && evolutions.length > 0) break;
    evolutions.push(current.species.name);
    current = current.evolves_to[0];
  }

  if (evolutions.length === 0) {
    evolutionContainer.innerText = 'Evolución: Ninguna';
    return;
  }

  evolutionContainer.innerHTML = 'Evolución: ';

  evolutions.forEach((name, index) => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      fetchPokemonData(name);
    });

    evolutionContainer.appendChild(link);

    if (index < evolutions.length - 1) {
      const arrow = document.createTextNode(' → ');
      evolutionContainer.appendChild(arrow);
    }
  });
}

function displayError(display = true) {
  const pokemonInfo = document.querySelector('.pokemon-info');
  const notFound = document.querySelector('.not-found');
  pokemonInfo.style.display = display ? "none" : "flex";
  notFound.style.display = display ? "block" : "none";
}

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

function fetchEvolutionData(speciesUrl) {
  fetch(speciesUrl)
    .then(response => response.json())
    .then(speciesData => fetch(speciesData.evolution_chain.url))
    .then(response => response.json())
    .then(evolutionData => displayEvolutionChain(evolutionData.chain))
    .catch(error => console.error('Error fetching evolution chain:', error));
}

function fetchPokemonDescription(speciesUrl) {
  fetch(speciesUrl)
    .then(response => response.json())
    .then(speciesData => {
      const descriptionText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es').flavor_text;
      document.getElementById('description-text').textContent = descriptionText;
    })
    .catch(error => console.error('Error fetching Pokémon description:', error));
}

function addFavoriteButton(pokemonName) {
  const nameContainer = document.getElementById('pokemon-name');
  const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
  let isFavorite = favorites.includes(pokemonName);

  const favoriteButton = document.createElement('button');
  favoriteButton.className = `favorite-button ${isFavorite ? 'active' : 'inactive'}`;
  favoriteButton.innerHTML = isFavorite ? '❤️' : '🖤';
  favoriteButton.style.cssText = `
    position: relative;
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    padding: 5px;
    margin-left: 10px;
    vertical-align: top;
  `;

  const updateButtonState = () => {
    const currentFavorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
    const isCurrentlyFavorite = currentFavorites.includes(pokemonName);
    favoriteButton.innerHTML = isCurrentlyFavorite ? '❤️' : '🖤';
    favoriteButton.classList.remove('active', 'inactive');
    favoriteButton.classList.add(isCurrentlyFavorite ? 'active' : 'inactive');
  };
  
  updateButtonState();

  favoriteButton.addEventListener('click', (e) => {
    e.preventDefault();
    const currentFavorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
    const index = currentFavorites.indexOf(pokemonName);
    
    if (index === -1) {
      currentFavorites.push(pokemonName);
      Swal.fire({
        title: '¡Añadido a favoritos!',
        text: `${pokemonName} ha sido añadido a tu lista`,
        icon: 'success',
        background: 'rgba(0, 0, 0, 0.5)',
        color: '#ffde00',
        confirmButtonColor: '#3b4cca'
      });
    } else {
      currentFavorites.splice(index, 1);
      Swal.fire({
        title: 'Eliminado de favoritos',
        text: `${pokemonName} ha sido eliminado de tu lista`,
        icon: 'error',
        background: 'rgba(0, 0, 0, 0.5)',
        color: '#ffde00',
        confirmButtonColor: '#3b4cca'
      });
    }
    
    localStorage.setItem('pokemonFavorites', JSON.stringify(currentFavorites));
    updateButtonState();
  });

  nameContainer.appendChild(favoriteButton);
}
