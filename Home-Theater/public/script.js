let allMovies = []; // Store all movies for filtering
let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || []; // Load watched movies from localStorage
let activeFilter = ''; // Track the active filter (e.g., genre or watched status)

// Fetch movies from the backend
async function fetchMovies() {
  const response = await fetch('/api/movies');
  const movies = await response.json();
  allMovies = movies; // Store all movies
  applyActiveFilter(); // Apply the active filter (defaults to showing all movies)
  updateMovieCounter(allMovies.length); // Update the movie counter
}

// Apply the active filter and display movies
function applyActiveFilter() {
  let filteredMovies = allMovies;

  if (activeFilter === 'watched') {
    // Filter by watched movies
    filteredMovies = allMovies.filter(movie => watchedMovies.includes(movie.id));
  } else if (activeFilter) {
    // Filter by genre
    filteredMovies = allMovies.filter(movie =>
      movie.metadata.genre && movie.metadata.genre.includes(activeFilter)
    );
  }

  displayMovies(filteredMovies); // Display the filtered movies
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

    // Add watched indicator
    const watchedIndicator = document.createElement('div');
    watchedIndicator.className = 'watched-indicator';

    // Set initial text based on watched status
    if (watchedMovies.includes(movie.id)) {
      watchedIndicator.textContent = 'Watched';
      watchedIndicator.style.opacity = 1; // Always visible for watched movies
    } else {
      watchedIndicator.textContent = 'Did you watch it?';
      watchedIndicator.style.opacity = 0; // Hidden by default for unwatched movies
    }

    movieCard.appendChild(watchedIndicator);

    // Show the indicator on hover for unwatched movies
    if (!watchedMovies.includes(movie.id)) {
      movieCard.addEventListener('mouseenter', () => {
        watchedIndicator.style.opacity = 1; // Show on hover
      });

      movieCard.addEventListener('mouseleave', () => {
        watchedIndicator.style.opacity = 0; // Hide when not hovering
      });
    }

    // Toggle watched status when the indicator is clicked
    watchedIndicator.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the card click event from firing
      toggleWatchedMovie(movie.id);
      applyActiveFilter(); // Re-render the movie list with the current filter
    });

    // Navigate to the movie landing page when clicked
    movieCard.addEventListener('click', () => {
      window.location.href = `/movie.html?id=${movie.id}`;
    });
  });

  updateMovieCounter(movies.length); // Update the movie counter
}

// Toggle watched status of a movie
function toggleWatchedMovie(movieId) {
  if (watchedMovies.includes(movieId)) {
    watchedMovies = watchedMovies.filter(id => id !== movieId); // Remove from watched list
  } else {
    watchedMovies.push(movieId); // Add to watched list
  }
  localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies)); // Save to localStorage
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
  activeFilter = genre; // Set the active filter
  applyActiveFilter(); // Apply the filter
}

// Filter movies by watched status
function filterWatchedMovies() {
  activeFilter = 'watched'; // Set the active filter
  applyActiveFilter(); // Apply the filter
}

// Search functionality
document.getElementById('search-bar')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm)
  );
  displayMovies(filteredMovies);
});

// Genre filter functionality
document.getElementById('filter-genre')?.addEventListener('change', (e) => {
  const genre = e.target.value;
  filterMoviesByGenre(genre);
});

// Side panel functionality
document.getElementById('all-movies')?.addEventListener('click', () => {
  activeFilter = ''; // Clear the active filter
  applyActiveFilter(); // Show all movies
});

document.getElementById('watched-movies')?.addEventListener('click', () => {
  filterWatchedMovies(); // Show only watched movies
});

// Toggle side panel visibility
document.getElementById('toggle-side-panel')?.addEventListener('click', () => {
  const sidePanel = document.getElementById('side-panel');
  const mainContent = document.querySelector('.main-content');
  sidePanel.classList.toggle('visible');
  mainContent.classList.toggle('shifted');
});

// Fetch movies when the page loads
fetchMovies();


// Movie Landing



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