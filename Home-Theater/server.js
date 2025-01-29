const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve media files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Helper function to find the first file with a specific extension in a folder
const findFileByExtension = (folderPath, extension) => {
  const files = fs.readdirSync(folderPath);
  return files.find(file => file.endsWith(extension));
};

// API to list movies
app.get('/api/movies', (req, res) => {
  const moviesDir = path.join(__dirname, 'media/movies');
  const movieFolders = fs.readdirSync(moviesDir);

  const movies = movieFolders.map(folder => {
    const folderPath = path.join(moviesDir, folder);

    // Find the movie file (any .mp4 file in the folder)
    const movieFile = findFileByExtension(folderPath, '.mp4');
    // Find the poster file (any .jpg or .png file in the folder)
    const posterFile = findFileByExtension(folderPath, '.jpg') || findFileByExtension(folderPath, '.png');

    if (movieFile && posterFile) {
      return {
        id: folder, // Use the folder name as the movie ID
        title: folder, // Use the folder name as the movie title
        poster: `/media/movies/${folder}/${posterFile}`,
        video: `/media/movies/${folder}/${movieFile}`
      };
    } else {
      return null; // Skip folders that don't have both files
    }
  }).filter(movie => movie !== null); // Remove null entries

  res.json(movies);
});

// API to get details for a specific movie
app.get('/api/movies/:id', (req, res) => {
  const movieId = req.params.id;
  const movieDir = path.join(__dirname, 'media/movies', movieId);

  if (!fs.existsSync(movieDir)) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  // Find the movie file (any .mp4 file in the folder)
  const movieFile = findFileByExtension(movieDir, '.mp4');
  // Find the poster file (any .jpg or .png file in the folder)
  const posterFile = findFileByExtension(movieDir, '.jpg') || findFileByExtension(movieDir, '.png');
  // Read additional info from info.txt (if it exists)
  const infoFile = path.join(movieDir, 'info.txt');
  const info = fs.existsSync(infoFile) ? fs.readFileSync(infoFile, 'utf-8') : 'No additional info available.';

  if (movieFile && posterFile) {
    res.json({
      id: movieId,
      title: movieId,
      poster: `/media/movies/${movieId}/${posterFile}`,
      video: `/media/movies/${movieId}/${movieFile}`,
      info: info
    });
  } else {
    res.status(404).json({ error: 'Movie files not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
app.get('/api/movies', (req, res) => {
  const moviesDir = path.join(__dirname, 'media/movies');
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