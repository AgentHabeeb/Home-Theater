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
  
  // Initialize the movie details page
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/movie.html') {
      fetchMovieDetails(); // Fetch and display movie details
    }
  });