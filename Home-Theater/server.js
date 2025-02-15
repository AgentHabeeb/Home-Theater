const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Path to the external directory
const externalMoviesDir = 'D:/movies';

// Serve media files from the external directory
app.use('/media', express.static(externalMoviesDir));

// Helper function to find the first file with a specific extension in a folder
const findFileByExtension = (folderPath, extension) => {
  const files = fs.readdirSync(folderPath);
  return files.find(file => file.endsWith(extension));
};

// Function to clean movie titles
function cleanMovieTitle(title) {
  title = title.replace(/\b(?:1080p|720p|4K|HDR|WEB-DL|BluRay|DVDRip|BRRip|HDTV|WEBRip|UHD)\b/gi, '');
  title = title.replace(/\b(?:YTS|RARBG|GalaxyRG|anoXmous|PSA|EVO|AMZN|NTb|Tigole)\b/gi, '');
  title = title.replace(/\b(?:x264|x265|H\.264|10bit|6CH|DTS|AAC|AC3|FLAC|DD5\.1)\b/gi, '');
  title = title.replace(/\b(?:\d+MB|\d+GB|\d+kbs|\d+fps)\b/gi, '');
  title = title.replace(/\b(?:Jean-Luc Godard|Andrei Tarkovsky|Quentin Tarantino|Christopher Nolan)\b/gi, '');
  title = title.replace(/[^\w\s]|_/g, '');
  title = title.replace(/\s+/g, ' ');
  title = title.trim();
  return title;
}

// API to list movies
app.get('/api/movies', (req, res) => {
  try {
    const movieFolders = fs.readdirSync(externalMoviesDir);

    const movies = movieFolders.map(folder => {
      const folderPath = path.join(externalMoviesDir, folder);

      // Find the movie file (any .mp4 file in the folder)
      const movieFile = findFileByExtension(folderPath, '.mp4');
      // Find the poster file (any .jpg or .png file in the folder)
      const posterFile = findFileByExtension(folderPath, '.jpg') || findFileByExtension(folderPath, '.png');
      // Read metadata from metadata.json (if it exists)
      const metadataFile = path.join(folderPath, 'metadata.json');
      const metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, 'utf-8')) : {};

      if (movieFile && posterFile) {
        return {
          id: folder,
          title: cleanMovieTitle(folder), // Clean the movie title
          poster: `/media/${folder}/${posterFile}`,
          video: `/media/${folder}/${movieFile}`,
          metadata: metadata // Include metadata
        };
      } else {
        return null; // Skip folders that don't have both files
      }
    }).filter(movie => movie !== null); // Remove null entries

    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// API to get details for a specific movie
app.get('/api/movies/:id', (req, res) => {
  try {
    const movieId = req.params.id;
    const movieDir = path.join(externalMoviesDir, movieId);

    if (!fs.existsSync(movieDir)) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Find the movie file (any .mp4 file in the folder)
    const movieFile = findFileByExtension(movieDir, '.mp4') || findFileByExtension(movieDir, '.mkv');
    // Find the poster file (any .jpg or .png file in the folder)
    const posterFile = findFileByExtension(movieDir, '.jpg') || findFileByExtension(movieDir, '.png');
    // Read metadata from metadata.json (if it exists)
    const metadataFile = path.join(movieDir, 'metadata.json');
    const metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, 'utf-8')) : {};

    if (movieFile && posterFile) {
      res.json({
        id: movieId,
        title: cleanMovieTitle(movieId), // Clean the movie title
        poster: `/media/${movieId}/${posterFile}`,
        video: `/media/${movieId}/${movieFile}`,
        metadata: metadata // Include metadata
      });
    } else {
      res.status(404).json({ error: 'Movie files not found' });
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Start the server
const localIP = '192.168.1.24'; 
app.listen(port, localIP, () => {
  console.log(`Server running at http://${localIP}:${port}`);
});