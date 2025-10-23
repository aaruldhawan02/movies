import Papa from 'papaparse';

// Configuration for file paths - adjust this if your base path changes
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/dc-movies`,
  csvFileName: 'moviePrequels.csv',
  movieInfoFileName: 'dcmovies.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;
let cachedMovieInfoData = null;

/**
 * Loads and parses the DC movies CSV file
 * @returns {Promise<Object>} A promise that resolves to a map of movies to their prequel relationships
 */
export const loadMoviePrequels = async () => {
  // Return cached data if available
  if (cachedMovieData) {
    console.log('Using cached movie data');
    return cachedMovieData;
  }
  
  try {
    // Construct the full path to the CSV file
    const csvPath = `${config.basePath}/${config.csvFileName}`;
    console.log(`Fetching CSV from: ${csvPath}`);
    
    // Fetch the CSV file
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Check if what we received is actually a CSV and not HTML
    if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
      throw new Error('Received HTML instead of CSV data. Path might be incorrect.');
    }
    
    // Parse the CSV
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: ({ data, meta, errors }) => {
          console.log(`Successfully parsed CSV with ${data.length} rows`);
          
          if (errors && errors.length > 0) {
            console.warn("Parse warnings:", errors);
          }
          
          const movieToPrequels = {};
          
          // Process data rows
          data.forEach((row) => {
            if (!row || typeof row !== 'object') return;
            
            // Get the movie title (should be in the 'movie' column)
            const movieTitle = row['movie']?.trim();
            if (!movieTitle) return;
            
            movieToPrequels[movieTitle] = [];
            
            // Check each field to see if it's a prequel (value of '1')
            Object.entries(row).forEach(([field, value]) => {
              if (field !== 'movie' && value === '1') {
                movieToPrequels[movieTitle].push(field);
              }
            });
          });
          
          console.log(`Built relationships for ${Object.keys(movieToPrequels).length} movies`);
          console.log('Sample movie titles:', Object.keys(movieToPrequels).slice(0, 5));
          
          // Cache the result
          cachedMovieData = movieToPrequels;
          
          resolve(movieToPrequels);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Failed to fetch or parse CSV:", error);
    throw error; // Re-throw to let the component handle the error
  }
};

/**
 * Normalizes movie titles to help with matching between different CSV files
 * @param {string} title - The movie title to normalize
 * @returns {string} A normalized version of the title for comparison
 */
const normalizeMovieTitle = (title) => {
  if (!title) return '';
  
  // Convert to lowercase
  let normalized = title.toLowerCase();
  
  // Remove special characters, extra spaces, and common words that might be different
  normalized = normalized
    .replace(/[:,.?!'"]/g, '')        // Remove punctuation
    .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
    .replace(/\bthe\b/g, '')          // Remove "the"
    .replace(/\band\b/g, '')          // Remove "and"
    .replace(/\bseason\b\s*\d+/g, '') // Remove "season X"
    .replace(/\bpart\b\s*\d+/g, '')   // Remove "part X"
    .trim();
  
  return normalized;
};

/**
 * Loads the movie info CSV with release dates and ratings
 * @returns {Promise<Object[]>} A promise that resolves to an array of movie info objects
 */
export const loadMovieInfo = async () => {
  // Return cached data if available
  if (cachedMovieInfoData) {
    console.log('Using cached movie info data');
    return cachedMovieInfoData;
  }
  
  try {
    // Construct the full path to the movie info CSV file
    const csvPath = `${config.basePath}/${config.movieInfoFileName}`;
    console.log(`Fetching movie info CSV from: ${csvPath}`);
    
    // Fetch the CSV file
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      console.error(`Failed to fetch movie info CSV: ${response.status} ${response.statusText}`);
      
      // Try alternative path - public folder directly
      console.log('Trying alternative path for movieInfo.csv...');
      const altPath = `/dc-movies/dcmovies.csv`;
      const altResponse = await fetch(altPath);
      
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch movie info CSV from alternative path: ${altResponse.status}`);
      }
      
      const text = await altResponse.text();
      return parseMovieInfoCSV(text);
    } else {
      const text = await response.text();
      return parseMovieInfoCSV(text);
    }
  } catch (error) {
    console.error("Failed to fetch or parse movie info CSV:", error);
    throw error;
  }
};

/**
 * Parse the movie info CSV content
 * @param {string} text - The CSV content as text
 * @returns {Promise<Object>} A promise that resolves to a map of movie titles to their info
 */
const parseMovieInfoCSV = (text) => {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: ({ data, errors }) => {
        console.log(`Successfully parsed movie info CSV with ${data.length} rows`);
        
        if (errors && errors.length > 0) {
          console.warn("Parse warnings:", errors);
        }
        
        // Create a map of movie titles to their info (release date, ratings, etc.)
        const movieInfoMap = {};
        
        data.forEach(row => {
          if (row && row.Name) {
            const title = row.Name.trim();
            movieInfoMap[title] = {
              releaseDate: row['Release Date'] || '',
              phase: row.Phase || '',
              criticRating: row['Critic Rating'] || '',
              audienceRating: row['Audience Rating'] || '',
              myTier: row['My Tier'] || '', // Add tier rating field
              format: row['Format'] || '', // Add format field
              trailer: row['Trailer'] || '' // Add trailer URL field
            };
            
            // Also add normalized version for better matching
            const normalizedTitle = normalizeMovieTitle(title);
            if (normalizedTitle && normalizedTitle !== title.toLowerCase()) {
              movieInfoMap[`__normalized__${normalizedTitle}`] = {
                originalTitle: title,
                ...movieInfoMap[title]
              };
            }
          }
        });
        
        console.log(`Loaded info for ${Object.keys(movieInfoMap).length} movies`);
        
        // Cache the result
        cachedMovieInfoData = movieInfoMap;
        
        resolve(movieInfoMap);
      },
      error: (error) => {
        console.error("Movie info CSV parsing error:", error);
        reject(error);
      }
    });
  });
};

/**
 * Parses a date string in various formats into a Date object
 * @param {string} dateStr - The date string to parse
 * @returns {Date} A Date object representing the parsed date
 */
const parseReleaseDate = (dateStr) => {
  if (!dateStr) return new Date(0); // Default to epoch if no date
  
  // Handle partial dates like "3/4" (missing year)
  if (dateStr.split('/').length === 2) {
    return new Date(0); // Default to epoch for incomplete dates
  }
  
  // Try to parse the date in MM/DD/YY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Default date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  console.warn(`Could not parse date: ${dateStr}, using epoch`);
  return new Date(0); // Default to epoch if parsing fails
};

/**
 * Gets all prequels for a specific movie, including indirect prequels (prequels of prequels)
 * @param {string} movieTitle - The title of the movie
 * @param {Object} movieToPrequels - The map of movies to their direct prequels
 * @returns {string[]} An array of all prequel movie titles
 */
export const getAllPrequels = (movieTitle, movieToPrequels) => {
  const visited = new Set();
  
  const findPrequels = (title) => {
    const prequels = movieToPrequels[title] || [];
    
    prequels.forEach(prequel => {
      if (!visited.has(prequel)) {
        visited.add(prequel);
        findPrequels(prequel);
      }
    });
  };
  
  findPrequels(movieTitle);
  return Array.from(visited);
};

/**
 * Gets the best viewing order for a movie, including all its prequels, sorted by release date
 * @param {string} movieTitle - The title of the movie
 * @param {Object} movieToPrequels - The map of movies to their direct prequels
 * @returns {Promise<string[]>} A promise that resolves to an array of movie titles in recommended viewing order
 */
export const getViewingOrder = async (movieTitle, movieToPrequels) => {
  // Get all prequels
  const prequels = getAllPrequels(movieTitle, movieToPrequels);
  
  // Add the target movie itself
  const allMovies = [...prequels, movieTitle];
  
  try {
    // Load movie info to get release dates
    const movieInfoMap = await loadMovieInfo();
    
    // Sort by release date
    return allMovies.sort((a, b) => {
      const dateA = parseReleaseDate(movieInfoMap[a]?.releaseDate || '');
      const dateB = parseReleaseDate(movieInfoMap[b]?.releaseDate || '');
      return dateA - dateB;
    });
  } catch (error) {
    console.error("Error sorting by release date:", error);
    
    // Fallback to topological sort if movie info loading fails
    console.log("Falling back to prequel-based ordering");
    
    // Create a graph representation
    const graph = {};
    const inDegree = {};
    
    // Initialize graph
    allMovies.forEach(movie => {
      graph[movie] = [];
      inDegree[movie] = 0;
    });
    
    // Build the graph
    Object.entries(movieToPrequels).forEach(([movie, moviePrequels]) => {
      if (allMovies.includes(movie)) {
        moviePrequels.forEach(prequel => {
          if (allMovies.includes(prequel)) {
            graph[prequel].push(movie);
            inDegree[movie] = (inDegree[movie] || 0) + 1;
          }
        });
      }
    });
    
    // Topological sort
    const queue = [];
    const result = [];
    
    // Add all nodes with no incoming edges to queue
    Object.keys(graph).forEach(movie => {
      if (inDegree[movie] === 0) {
        queue.push(movie);
      }
    });
    
    // Process queue
    while (queue.length > 0) {
      const movie = queue.shift();
      result.push(movie);
      
      graph[movie].forEach(nextMovie => {
        inDegree[nextMovie]--;
        if (inDegree[nextMovie] === 0) {
          queue.push(nextMovie);
        }
      });
    }
    
    return result;
  }
};