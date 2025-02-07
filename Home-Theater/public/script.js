let allMovies = []; // Store all movies for filtering

// Fetch movies from the backend
async function fetchMovies() {
  const response = await fetch('/api/movies');
  const movies = await response.json();
  allMovies = movies; // Store all movies
  displayMovies(movies); // Display all movies initially
  updateMovieCounter(movies.length); // Update the movie counter
}

// Display movies in the grid
function displayMovies(movies) {
  const movieList = document.getElementById('movie-list');
  if (!movieList) return; // Exit if the element doesn't exist

  movieList.innerHTML = ''; // Clear the current list

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';

    const poster = document.createElement('img');
    poster.src = movie.poster;
    poster.alt = movie.title;

    const title = document.createElement('h3');
    title.textContent = movie.title;

    movieCard.appendChild(poster);
    movieCard.appendChild(title);
    movieList.appendChild(movieCard);

    // Navigate to the movie landing page when clicked
    movieCard.addEventListener('click', () => {
      window.location.href = `/movie.html?id=${movie.id}`;
    });
  });

  updateMovieCounter(movies.length); // Update the movie counter
}

// Update the movie counter
function updateMovieCounter(count) {
  const movieCountElement = document.getElementById('movie-count');
  if (movieCountElement) {
    movieCountElement.textContent = count;
  }
}

// Filter movies by genre
function filterMoviesByGenre(genre) {
  if (genre === '') {
    displayMovies(allMovies); // Show all movies if no genre is selected
  } else {
    const filteredMovies = allMovies.filter(movie =>
      movie.metadata.genre && movie.metadata.genre.includes(genre)
    );
    displayMovies(filteredMovies);
  }
}

// Movie Landing Page: Fetch and display movie details
async function fetchMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    const response = await fetch(`/api/movies/${movieId}`);
    const movie = await response.json();

    // Update DOM with movie details
    document.getElementById('movie-poster').src = movie.poster;
    document.getElementById('movie-title').textContent = movie.metadata.title || movie.title;
    document.getElementById('movie-year').textContent = `Year: ${movie.metadata.year || 'N/A'}`;
    document.getElementById('movie-genre').textContent = `Genre: ${movie.metadata.genre ? movie.metadata.genre.join(', ') : 'N/A'}`;
    document.getElementById('movie-rating').textContent = `Rating: ${movie.metadata.rating || 'N/A'}`;
    document.getElementById('movie-director').textContent = `Director: ${movie.metadata.director || 'N/A'}`;
    document.getElementById('movie-description').textContent = movie.metadata.description || 'No description available.';

    // Play button functionality
    const playButton = document.getElementById('play-button');
    if (playButton) {
      playButton.addEventListener('click', () => {
        window.location.href = `/watch.html?id=${movieId}`;
      });
    }

    // Back to Main button functionality
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.location.href = '/index.html';
      });
    }
  }
}

// Watching Page: Initialize Video.js player
async function initializeVideoPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    const response = await fetch(`/api/movies/${movieId}`);
    const movie = await response.json();

    document.getElementById('movie-title').textContent = movie.title;

    // Initialize Video.js player
    const player = videojs('my-video', {
      controls: true,
      autoplay: true,
      preload: 'auto'
    });

    // Set the video source
    player.src({ type: 'video/mp4', src: movie.video });

    // Back to Movie button functionality
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.location.href = `/movie.html?id=${movieId}`;
      });
    }
  }
}

// Check which page is loaded and run the appropriate function
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
  // Main Page: Add search and filter functionality
  const searchBar = document.getElementById('search-bar');
  const filterGenre = document.getElementById('filter-genre');

  if (searchBar && filterGenre) {
    searchBar.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredMovies = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm)
      );
      displayMovies(filteredMovies);
    });

    filterGenre.addEventListener('change', (e) => {
      const genre = e.target.value;
      filterMoviesByGenre(genre);
    });
  }

  fetchMovies(); // Fetch and display movies
} else if (window.location.pathname === '/movie.html') {
  fetchMovieDetails(); // Fetch and display movie details
} else if (window.location.pathname === '/watch.html') {
  initializeVideoPlayer(); // Initialize the video player
}