import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/yrf-spy-universe`, // Base path for the project
  csvFileName: 'yrf-spy-universe.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the YRF Spy Universe movies CSV file
 * @returns {Promise<Array>} A promise that resolves to an array of movie objects
 */
export const loadMovieData = async () => {
  // Return cached data if available
  if (cachedMovieData) {
    console.log('Using cached movie data');
    return cachedMovieData;
  }

  try {
    console.log('Loading YRF Spy Universe movie data...');
    
    // Construct the full path to the CSV file
    const csvPath = `${config.basePath}/yrf-spy-universe.csv`;
    console.log('CSV Path:', csvPath);
    
    // Fetch the CSV file
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV loaded successfully, length:', csvText.length);
    
    // Parse the CSV using Papa Parse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Clean up header names by trimming whitespace
        return header.trim();
      },
      transform: (value, field) => {
        // Clean up values by trimming whitespace
        return value.trim();
      }
    });
    
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
    }
    
    console.log('Parsed data:', parseResult.data);
    
    // Process and validate the data
    const processedData = parseResult.data
      .filter(row => row.Name && row.Name.trim() !== '') // Filter out empty rows
      .map((row, index) => {
        // Parse ratings and handle N/A values
        const parseRating = (rating) => {
          if (!rating || rating === 'N/A' || rating.trim() === '') return null;
          // Remove % sign if present and convert to number
          const numericRating = parseFloat(rating.replace('%', ''));
          return isNaN(numericRating) ? null : numericRating;
        };

        const parseMyRating = (rating) => {
          if (!rating || rating === 'N/A' || rating.trim() === '') return null;
          // Handle ratings like "3/5" or "3.5/5"
          if (rating.includes('/')) {
            const [numerator] = rating.split('/');
            return parseFloat(numerator);
          }
          return parseFloat(rating);
        };

        const parseDate = (dateStr) => {
          if (!dateStr || dateStr === 'N/A' || dateStr.trim() === '') return null;
          try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
          } catch (e) {
            console.warn(`Invalid date format: ${dateStr}`);
            return null;
          }
        };

        return {
          id: index + 1,
          name: row.Name,
          releaseDate: parseDate(row['Release Date']),
          parsedReleaseDate: parseDate(row['Release Date']), // Add this for mission-impossible compatibility
          releaseDateString: row['Release Date'],
          criticRating: parseRating(row['Critic Rating']),
          audienceRating: parseRating(row['Audience Rating']),
          myRating: parseMyRating(row['My Rating']),
          myRatingString: row['My Rating'],
          trailer: row.Trailer && row.Trailer !== 'N/A' ? row.Trailer : null,
          // Generate a URL-friendly slug for routing
          slug: row.Name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim('-') // Remove leading/trailing hyphens
        };
      });
    
    console.log('Processed movie data:', processedData);
    
    // Cache the processed data
    cachedMovieData = processedData;
    
    return processedData;
    
  } catch (error) {
    console.error('Error loading movie data:', error);
    throw new Error(`Failed to load YRF Spy Universe movie data: ${error.message}`);
  }
};

/**
 * Gets a specific movie by its slug
 * @param {string} slug - The URL-friendly movie identifier
 * @returns {Promise<Object|null>} The movie object or null if not found
 */
export const getMovieBySlug = async (slug) => {
  try {
    const movies = await loadMovieData();
    const movie = movies.find(m => m.slug === slug);
    
    if (!movie) {
      console.warn(`Movie not found for slug: ${slug}`);
      return null;
    }
    
    return movie;
  } catch (error) {
    console.error('Error getting movie by slug:', error);
    return null;
  }
};

/**
 * Gets all movies sorted by release date (newest first)
 * @returns {Promise<Array>} Array of movie objects sorted by release date
 */
export const getAllMoviesSorted = async () => {
  try {
    const movies = await loadMovieData();
    
    // Sort by release date, with unreleased movies (null dates) at the end
    return movies.sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return b.releaseDate - a.releaseDate; // Newest first
    });
  } catch (error) {
    console.error('Error getting sorted movies:', error);
    return [];
  }
};

/**
 * Utility function to format dates for display
 * @param {Date|null} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'TBA';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Utility function to format ratings for display
 * @param {number|null} rating - The rating to format
 * @param {string} suffix - Optional suffix (like '%')
 * @returns {string} Formatted rating string
 */
export const formatRating = (rating, suffix = '') => {
  if (rating === null || rating === undefined) return 'N/A';
  return `${rating}${suffix}`;
};

/**
 * Format date for display (mission-impossible style)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatReleaseDate = (date) => {
  if (!date) return 'TBA';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Convert movie title to image filename
 * @param {string} title - The movie title
 * @returns {string} Image filename
 */
export const getImageFilename = (title) => {
  // Replace spaces with underscores and remove special characters like : and ,
  return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
};

/**
 * Get full image path with basePath
 * @param {string} filename - The image filename
 * @returns {string} Full image path
 */
export const getImagePath = (filename) => {
  return `${config.basePath}/movieposters/${filename}`;
};

export default {
  loadMovieData,
  getMovieBySlug,
  getAllMoviesSorted,
  formatDate,
  formatRating,
  formatReleaseDate,
  getImageFilename,
  getImagePath
};
