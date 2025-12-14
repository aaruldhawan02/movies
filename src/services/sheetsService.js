// Simple Google Sheets API approach using public CSV export
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

// Cache for sheets data
let cachedMovieData = null;

/**
 * Fetches all movie data from Google Sheets using CSV export
 * @returns {Promise<Array>} Array of movie objects matching CSV structure
 */
export const fetchAllMoviesFromSheets = async () => {
  try {
    // Use Google Sheets CSV export URL with cache busting
    const timestamp = new Date().getTime();
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0&t=${timestamp}`;
    
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
    
    console.log(`Loaded ${movieData.length} movies from Google Sheets`);
    console.log('Headers found:', headers);
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
