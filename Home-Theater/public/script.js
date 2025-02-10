let allMovies = []; // Store all movies for filtering
let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || []; // Load watched movies from localStorage
let activeFilter = ''; // Track the active filter (e.g., genre or watched status)
let searchTerm = ''; // Track the current search term
let player; // Declare Video.js player globally
// Update the movie counter
function updateMovieCounter(count) {
  const movieCountElement = document.getElementById('movie-count');
  if (movieCountElement) {
    movieCountElement.textContent = count;
  }
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

// Show an overlay indicator for player actions
function showOverlay(text) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay-indicator';
  overlay.textContent = text;
  document.querySelector('.video-player-container').appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 1000); // Remove after 1 second
}
// Fetch movies from the backend
async function fetchMovies() {
  try {
    const response = await fetch('/api/movies');
    const movies = await response.json();
    allMovies = movies; // Store all movies
    applyActiveFilter(); // Apply the active filter (defaults to showing all movies)
    updateMovieCounter(allMovies.length); // Update the movie counter
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}

// Apply the active filter and search term, then display movies
function applyActiveFilter() {
  let filteredMovies = allMovies;

  // Apply search term filter
  if (searchTerm) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm)
    );
  }

  // Apply genre or watched status filter
  if (activeFilter === 'watched') {
    filteredMovies = filteredMovies.filter(movie => watchedMovies.includes(movie.id));
  } else if (activeFilter) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.metadata.genre && movie.metadata.genre.includes(activeFilter)
    );
  }

  displayMovies(filteredMovies); // Display the filtered movies
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
// Display movies in the grid
function displayMovies(movies) {
  const movieList = document.getElementById('movie-list');
  if (!movieList) return; // Exit if the element doesn't exist

  movieList.innerHTML = ''; // Clear the current list

  if (movies.length === 0) {
    // Dynamic placeholder message based on the active filter and search term
    let placeholderText = 'No movies found.'; // Default message

    if (activeFilter === 'watched') {
      placeholderText = 'You have not watched any movies yet.';
    } else if (searchTerm) {
      placeholderText = `No movies match "${searchTerm}".`;
    } else if (activeFilter) {
      placeholderText = `No movies found in the "${activeFilter}" genre.`;
    }

    // Create and display the placeholder message
    const placeholder = document.createElement('div');
    placeholder.className = 'no-movies-placeholder';
    placeholder.textContent = placeholderText;
    movieList.appendChild(placeholder);
  } else {
    // Display movies if the list is not empty
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
        applyActiveFilter(); // Re-render the movie list with the current filter and search term
      });

      // Navigate to the movie landing page when clicked
      movieCard.addEventListener('click', () => {
        window.location.href = `/movie.html?id=${movie.id}`;
      });
    });
  }

  updateMovieCounter(movies.length); // Update the movie counter
}
// Search functionality
document.getElementById('search-bar')?.addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase(); // Update the search term
  applyActiveFilter(); // Apply the search term and active filter
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
// Fetch and display movie details
async function fetchMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    try {
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
      document.getElementById('play-button')?.addEventListener('click', () => {
        window.location.href = `/watch.html?id=${movieId}`;
      });

      // Back to Main button functionality
      document.getElementById('back-button')?.addEventListener('click', () => {
        window.location.href = '/index.html';
      });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }
}
// Initialize Video.js player
function initializeVideoPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    fetch(`/api/movies/${movieId}`)
      .then(response => response.json())
      .then(movie => {
        console.log('Movie details:', movie); // Log the movie details

        // Set the movie title
        document.getElementById('movie-title').textContent = movie.title;

        // Check if the player is already initialized
        if (!player) {
          // Initialize Video.js player
          player = videojs('my-video', {
            controls: true,
            autoplay: true,
            preload: 'auto',
            fluid: true, // Make the player responsive
            playbackRates: [0.5, 1, 1.5, 2], // Optional: Add playback speed controls
          });

          // Disable Video.js default keyboard shortcuts
          player.off('keydown'); // Remove Video.js default keydown handler
        }

        // Set the video source
        player.src({ type: 'video/mp4', src: movie.video });

        // Show/hide loading spinner during buffering
        player.on('waiting', () => {
          document.querySelector('.loading-spinner').style.display = 'block';
        });

        player.on('playing', () => {
          document.querySelector('.loading-spinner').style.display = 'none';
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
          // Prevent default behavior for Spacebar
          if (e.code === 'Space') {
            e.preventDefault(); // Prevent default behavior

            // Use native HTML5 video methods for play/pause
            const videoElement = document.querySelector('video');
            if (videoElement.paused) {
              videoElement.play();
              showOverlay('Playing');
            } else {
              videoElement.pause();
              showOverlay('Paused');
            }
          }

          // Forward 10 seconds
          if (e.code === 'ArrowRight') {
            player.currentTime(player.currentTime() + 10);
            showOverlay('Forward 10s');
          }

          // Backward 10 seconds
          if (e.code === 'ArrowLeft') {
            player.currentTime(player.currentTime() - 10);
            showOverlay('Backward 10s');
          }

          // Toggle fullscreen (F key)
          if (e.code === 'KeyF') {
            if (player.isFullscreen()) {
              player.exitFullscreen();
            } else {
              player.requestFullscreen();
            }
            showOverlay(player.isFullscreen() ? 'Fullscreen On' : 'Fullscreen Off');
          }
        });

        // Back Button Functionality
        document.getElementById('back-button')?.addEventListener('click', () => {
          window.location.href = `/movie.html?id=${movieId}`;
        });
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
      });
  }
}
// Initialize the appropriate page based on the current URL
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    fetchMovies(); // Fetch and display movies
  } else if (window.location.pathname === '/movie.html') {
    fetchMovieDetails(); // Fetch and display movie details
  } else if (window.location.pathname === '/watch.html') {
    initializeVideoPlayer(); // Initialize the video player
  }
});