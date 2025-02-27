class FavoritesManager {
  constructor() {
    this.favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
    this.grid = document.getElementById('favorites-grid');
    this.emptyMessage = document.getElementById('empty-message');
    this.init();
  }

  init() {
    this.displayFavorites();
  }

  displayFavorites() {
    this.grid.innerHTML = '';
    
    if (this.favorites.length === 0) {
      this.emptyMessage.style.display = 'block';
      return;
    }
    
    this.emptyMessage.style.display = 'none';
    
    this.favorites.forEach(pokemonName => {
      this.fetchAndDisplayPokemon(pokemonName);
    });
  }

  fetchAndDisplayPokemon(pokemonName) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then(response => response.json())
      .then(pokemon => this.createPokemonCard(pokemon));
  }

  createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const favButton = document.createElement('button');
    favButton.className = 'favorite-star active';
    favButton.innerHTML = '❤️';
    favButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.8em;
      cursor: pointer;
      padding: 5px;
      transition: all 0.3s ease;
      z-index: 10;
    `;

    favButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFavorite(pokemon.name);
    });

    card.appendChild(favButton);

    const number = document.createElement('p');
    number.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    
    const img = document.createElement('img');
    img.src = pokemon.sprites.front_default;
    img.alt = pokemon.name;
    
    const name = document.createElement('p');
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    
    const typeContainer = document.createElement('div');
    typeContainer.className = 'pokemon-types';
    
    pokemon.types.forEach(typeInfo => {
      const typeName = typeInfo.type.name;
      const typeIcon = document.createElement('img');
      typeIcon.src = `https://pokemon-project.com/leyendasarceus/img/tipos/${typeName.charAt(0).toUpperCase() + typeName.slice(1)}.png`;
      typeIcon.alt = typeName;
      typeIcon.className = `type-icon type-${typeName}`;
      typeContainer.appendChild(typeIcon);
    });

    card.appendChild(number);
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(typeContainer);

    card.addEventListener('click', () => {
      window.location.href = `pokemon.html?pokemon=${pokemon.name}`;
    });

    card.addEventListener('mousemove', this.handleMouseMove);
    card.addEventListener('mouseleave', this.handleMouseLeave);

    this.grid.appendChild(card);
  }

  handleMouseMove(event) {
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

  handleMouseLeave(event) {
    event.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }

  removeFavorite(pokemonName) {
    this.favorites = this.favorites.filter(name => name !== pokemonName);
    localStorage.setItem('pokemonFavorites', JSON.stringify(this.favorites));
    this.displayFavorites();
    
    Swal.fire({
      title: '¡Eliminado!',
      text: `${pokemonName} ha sido eliminado de tus favoritos`,
      icon: 'error',
      background: 'rgba(0, 0, 0, 0.5)',
      color: '#ffde00',
      confirmButtonColor: '#3b4cca'
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FavoritesManager();
});
