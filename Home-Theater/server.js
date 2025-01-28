const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve media files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Read the custom movies directory from the config file
const configPath = path.join(__dirname, 'config', 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('Config file not found. Please create config/config.json.');
  process.exit(1);
}

const config = require(configPath);
const moviesDir = config.moviesDir || path.join(__dirname, 'media/movies');

// Log the movies directory for debugging
console.log(`Movies directory: ${moviesDir}`);

// Helper function to find the first file with a specific extension in a folder
const findFileByExtension = (folderPath, extension) => {
  const files = fs.readdirSync(folderPath);
  return files.find(file => file.endsWith(extension));
};

// API to list movies
app.get('/api/movies', (req, res) => {
  if (!fs.existsSync(moviesDir)) {
    return res.status(500).json({ error: 'Movies directory not found' });
  }

  const movieFolders = fs.readdirSync(moviesDir);

  const movies = movieFolders.map(folder => {
    const folderPath = path.join(moviesDir, folder);

    // Find the movie file (any .mp4 file in the folder)
    const movieFile = findFileByExtension(folderPath, '.mp4');
    // Find the poster file (any .jpg or .png file in the folder)
    const posterFile = findFileByExtension(folderPath, '.jpg') || findFileByExtension(folderPath, '.png');
    // Read additional info from info.txt (if it exists)
    const infoFile = path.join(folderPath, 'info.txt');
    const info = fs.existsSync(infoFile) ? fs.readFileSync(infoFile, 'utf-8') : 'No additional info available.';

    if (movieFile && posterFile) {
      return {
        id: folder,
        title: folder,
        poster: `/media/movies/${folder}/${posterFile}`,
        video: `/media/movies/${folder}/${movieFile}`,
        genre: 'Action' // Add a genre field (you can customize this)
      };
    } else {
      return null;
    }
  }).filter(movie => movie !== null);

  res.json(movies);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});