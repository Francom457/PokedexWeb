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

const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

const translatedType = typeTranslations[type] || type;
document.getElementById('tipo-seleccionado').textContent = `Pokémon de tipo ${translatedType.charAt(0).toUpperCase() + translatedType.slice(1)}`;

let currentOffset = 0;
const limit = 10;
let pokemonList = [];

fetch(`https://pokeapi.co/api/v2/type/${type}`)
  .then(response => response.json())
  .then(data => {
    pokemonList = data.pokemon.map(entry => entry.pokemon);
    displayPokemonBatch();
  })
  .catch(error => console.error('Error al cargar Pokémon:', error));

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
  const grid = document.getElementById('pokemon-grid');
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
        favButton.innerHTML = favorites.includes(pokemonData.name) ? '★' : '✰';
        
        favButton.addEventListener('mouseover', () => {
          if (favorites.includes(pokemonData.name)) {
            favButton.textContent = '✰';
          }
        });

        favButton.addEventListener('mouseout', () => {
          if (favorites.includes(pokemonData.name)) {
            favButton.textContent = '★';
          }
        });

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

        grid.appendChild(card);
      })
      .catch(error => console.error('Error al cargar el sprite del Pokémon:', error));
  });

  currentOffset = end;
  if (currentOffset >= pokemonList.length) {
    document.getElementById('load-more').style.display = 'none';
  } else {
    document.getElementById('load-more').style.display = 'block';
  }
}

function toggleFavorite(pokemonName, button) {
  const favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
  const isFavorite = favorites.includes(pokemonName);

  if (isFavorite) {
    const index = favorites.indexOf(pokemonName);
    favorites.splice(index, 1);
    button.innerHTML = '✰';
    button.classList.replace('active', 'inactive');
    Swal.fire({
      title: 'Eliminado de favoritos',
      text: `${pokemonName} ha sido eliminado de tu lista`,
      icon: 'info',
      confirmButtonColor: '#3b4cca'
    });
  } else {
    favorites.push(pokemonName);
    button.innerHTML = '★';
    button.classList.replace('inactive', 'active');
    Swal.fire({
      title: '¡Añadido a favoritos!',
      text: `${pokemonName} ha sido añadido a tu lista`,
      icon: 'success',
      confirmButtonColor: '#3b4cca'
    });
  }

  localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

document.getElementById('load-more').addEventListener('click', displayPokemonBatch);