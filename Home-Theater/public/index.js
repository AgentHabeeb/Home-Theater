let allMovies = []; // Store all movies for filtering
let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || []; // Load watched movies from localStorage
let activeFilter = ''; // Track the active filter (e.g., genre or watched status)
let searchTerm = ''; // Track the current search term

// Update the movie counter
function updateMovieCounter(count) {
  const movieCountElement = document.getElementById('movie-count');
  if (movieCountElement) {
    movieCountElement.textContent = count;
  }
}
// back to top button

document.addEventListener("DOMContentLoaded", function () {
  const backToTopButton = document.getElementById("back-to-top");

  // Show button when user scrolls down
  window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  });

  // Scroll to top when button is clicked
  backToTopButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Toggle watched status of a movie
function toggleWatchedMovie(movieId) {
  if (watchedMovies.includes(movieId)) {
    watchedMovies = watchedMovies.filter(id => id !== movieId); // Remove from watched list
  } else {
    watchedMovies.push(movieId); // Add to watched list
  }
  localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies)); // Save to localStorage
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

// Initialize the main page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    fetchMovies(); // Fetch and display movies
  }
});