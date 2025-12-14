// Simple Google Sheets API approach using public CSV export
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

// Cache for sheets data
let cachedMovieData = null;

/**
 * Fetches all movie data from Google Sheets using CSV export
 * @returns {Promise<Array>} Array of movie objects matching CSV structure
 */
export const fetchAllMoviesFromSheets = async () => {
  // Return cached data if available
  if (cachedMovieData) {
    console.log('Using cached movie data from sheets');
    return cachedMovieData;
  }

  try {
    // Use Google Sheets CSV export URL (requires sheet to be public)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    console.log('Fetching from Google Sheets CSV export...');
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV manually (simple approach)
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const movieData = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const movie = {};
        headers.forEach((header, index) => {
          movie[header] = values[index] || '';
        });
        return movie;
      });
    
    // Cache the result
    cachedMovieData = movieData;
    
    console.log(`Loaded ${movieData.length} movies from Google Sheets`);
    return movieData;
    
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return []; // Return empty array on error
  }
};

/**
 * Clear cached data (useful for refreshing)
 */
export const clearMovieCache = () => {
  cachedMovieData = null;
  console.log('Movie cache cleared');
};
