import Papa from 'papaparse';
import { fetchAllMoviesFromSheets } from './sheetsService';

// Configuration - set to true to use Google Sheets, false to use CSV
const USE_GOOGLE_SHEETS = process.env.REACT_APP_USE_GOOGLE_SHEETS === 'true';

/**
 * Loads all movie data from either Google Sheets or CSV based on configuration
 * @returns {Promise<Array>} Array of movie objects
 */
export const loadAllMovies = async () => {
  try {
    if (USE_GOOGLE_SHEETS) {
      console.log('Loading movies from Google Sheets...');
      return await fetchAllMoviesFromSheets();
    } else {
      console.log('Loading movies from CSV...');
      return await loadMoviesFromCSV();
    }
  } catch (error) {
    console.error('Error loading movies:', error);
    return []; // Return empty array on error
  }
};

/**
 * Loads movie data from AllMovies.csv (original method)
 * @returns {Promise<Array>} Array of movie objects
 */
const loadMoviesFromCSV = async () => {
  const response = await fetch(`${process.env.PUBLIC_URL || '.'}/AllMovies.csv`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data || []);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
