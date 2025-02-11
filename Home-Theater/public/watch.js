let player; // Declare Video.js player globally

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

// Initialize Video.js player
function initializeVideoPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    fetch(`/api/movies/${movieId}`)
      .then(response => response.json())
      .then(movie => {
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

        // Update progress bar and runtime
        player.on('timeupdate', () => {
          const currentTime = player.currentTime();
          const duration = player.duration();
          const runtimeDisplay = document.getElementById('runtime-display');
        
          if (runtimeDisplay) {
            const formatTime = (time) => {
              const minutes = Math.floor(time / 60);
              const seconds = Math.floor(time % 60);
              return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            };
        
            runtimeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
          }
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

// Initialize the video player page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/watch.html') {
    initializeVideoPlayer(); // Initialize the video player
  }
});