import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/harrypotter`, // Base path for the project
  csvFileName: 'harrypotter.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Harry Potter movies CSV file
 * @returns {Promise<Array>} A promise that resolves to an array of movie objects
 */
export const loadMovieData = async () => {
  // Return cached data if available
  if (cachedMovieData) {
    console.log('Using cached movie data');
    return cachedMovieData;
  }
  
  try {
    // Construct the full path to the CSV file
    const csvPath = `${config.basePath}/${config.csvFileName}`;
    console.log(`Fetching CSV from: ${csvPath}`);
    
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Parse the CSV
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: ({ data, errors }) => {
          if (errors.length > 0) {
            console.error('CSV parsing errors:', errors);
            reject(new Error('Failed to parse CSV data'));
            return;
          }
          
          // Process the data to include parsed dates
          const processedData = data.map(movie => {
            // Parse the release date
            const releaseDate = new Date(movie['Release Date']);
            
            return {
              ...movie,
              parsedReleaseDate: releaseDate
            };
          });
          
          // Cache the processed data
          cachedMovieData = processedData;
          console.log(`Loaded ${processedData.length} Harry Potter movies`);
          resolve(processedData);
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          reject(new Error('Failed to parse CSV data'));
        }
      });
    });
  } catch (error) {
    console.error('Error loading movie data:', error);
    throw error;
  }
};

/**
 * Gets all movies sorted by release date (most recent first)
 * @returns {Promise<Array>} Array of all movies
 */
export const getAllMovies = async () => {
  const movies = await loadMovieData();
  
  // Sort by release date (most recent first)
  return movies.sort((a, b) => b.parsedReleaseDate - a.parsedReleaseDate);
};

/**
 * Formats a release date for display
 * @param {string} dateString - The date string from the CSV
 * @returns {string} Formatted date string
 */
export const formatReleaseDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Gets the filename for a movie image based on the movie name
 * @param {string} movieName - The name of the movie
 * @returns {string} The filename for the movie image
 */
export const getImageFilename = (movieName) => {
  // Convert movie name to filename format: replace spaces with underscores, keep apostrophes and other chars
  return movieName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/['"]/g, '') // Remove quotes but keep apostrophes in the original
    .replace(/:/g, '') // Remove colons
    .replace(/\?/g, '') // Remove question marks
    .replace(/-/g, '_'); // Replace hyphens with underscores
};

/**
 * Gets the full path to a movie image
 * @param {string} movieName - The name of the movie
 * @returns {string} The full path to the movie image
 */
export const getImagePath = (movieName) => {
  const filename = getImageFilename(movieName);
  return `${process.env.PUBLIC_URL || '.'}/posters/${filename}.png`;
};

/**
 * Gets a movie by its name
 * @param {string} movieName - The name of the movie to find
 * @returns {Promise<Object|null>} The movie object or null if not found
 */
export const getMovieByName = async (movieName) => {
  const movies = await loadMovieData();
  return movies.find(movie => movie.Name === movieName) || null;
};

/**
 * Searches movies by name
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching movies
 */
export const searchMovies = async (searchTerm) => {
  const movies = await loadMovieData();
  const term = searchTerm.toLowerCase();
  
  return movies.filter(movie => 
    movie.Name.toLowerCase().includes(term)
  );
};
