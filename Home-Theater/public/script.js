// Main Page: Fetch and display movies
async function fetchMovies() {
  const response = await fetch('/api/movies');
  const movies = await response.json();
  const movieList = document.getElementById('movie-list');

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';

    const poster = document.createElement('img');
    poster.src = movie.poster;
    poster.alt = movie.title;

    const title = document.createElement('h2');
    title.textContent = movie.title;

    movieCard.appendChild(poster);
    movieCard.appendChild(title);
    movieList.appendChild(movieCard);

    // Navigate to the movie landing page when clicked
    movieCard.addEventListener('click', () => {
      window.location.href = `/movie.html?id=${movie.id}`;
    });
  });
}

// Movie Landing Page: Fetch and display movie details
async function fetchMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    const response = await fetch(`/api/movies/${movieId}`);
    const movie = await response.json();

    document.getElementById('movie-poster').src = movie.poster;
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('movie-info').textContent = movie.info;

    // Play button functionality
    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', () => {
      window.location.href = `/watch.html?id=${movieId}`;
    });

    // Back to Main button functionality
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
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
    backButton.addEventListener('click', () => {
      window.location.href = `/movie.html?id=${movieId}`;
    });
  }
}

// Check which page is loaded and run the appropriate function
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
  fetchMovies();
} else if (window.location.pathname === '/movie.html') {
  fetchMovieDetails();
} else if (window.location.pathname === '/watch.html') {
  initializeVideoPlayer();
}
let allMovies = []; // Store all movies for filtering

// Fetch movies from the backend
async function fetchMovies() {
  const response = await fetch('/api/movies');
  const movies = await response.json();
  allMovies = movies; // Store all movies
  displayMovies(movies);
}

// Display movies in the grid
function displayMovies(movies) {
  const movieList = document.getElementById('movie-list');
  movieList.innerHTML = ''; // Clear the current list

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';

    const poster = document.createElement('img');
    poster.src = movie.poster;
    poster.alt = movie.title;

    const title = document.createElement('h2');
    title.textContent = movie.title;

    movieCard.appendChild(poster);
    movieCard.appendChild(title);
    movieList.appendChild(movieCard);

    // Navigate to the movie landing page when clicked
    movieCard.addEventListener('click', () => {
      window.location.href = `/movie.html?id=${movie.id}`;
    });
  });
}

// Search functionality
document.getElementById('search-bar').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm)
  );
  displayMovies(filteredMovies);
});

// Filter by genre
document.getElementById('filter-genre').addEventListener('change', (e) => {
  const genre = e.target.value;
  if (genre === '') {
    displayMovies(allMovies); // Show all movies if no genre is selected
  } else {
    const filteredMovies = allMovies.filter(movie =>
      movie.genre === genre // Assuming each movie has a "genre" property
    );
    displayMovies(filteredMovies);
  }
});

// Fetch movies when the page loads
fetchMovies();