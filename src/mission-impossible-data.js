import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/mission-impossible`, // Base path for the project
  csvFileName: 'missionimpossible.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Mission Impossible movies CSV file
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
            return {
              ...movie,
              parsedReleaseDate: parseReleaseDate(movie['Release Date'])
            };
          });
          
          // Cache the result
          cachedMovieData = processedData;
          resolve(processedData);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading movie data:', error);
    
    // Fallback data in case the CSV can't be loaded
    const fallbackData = [
      {
        "Name": "Mission Impossible",
        "Release Date": "5/22/1996",
        "Critic Rating": "65%",
        "Audience Rating": "71%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=L8Pbjh4EZRk",
        "parsedReleaseDate": new Date(1996, 4, 22)
      },
      {
        "Name": "Mission Impossible 2",
        "Release Date": "5/24/2000",
        "Critic Rating": "57%",
        "Audience Rating": "42%",
        "My Rating": "2.5/5",
        "Trailer": "https://www.youtube.com/watch?v=HwXbmwTvoT4",
        "parsedReleaseDate": new Date(2000, 4, 24)
      },
      {
        "Name": "Mission Impossible III",
        "Release Date": "5/5/2006",
        "Critic Rating": "73%",
        "Audience Rating": "69%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=4oVva0muTE8",
        "parsedReleaseDate": new Date(2006, 4, 5)
      },
      {
        "Name": "Mission Impossible: Ghost Protocol",
        "Release Date": "12/21/2011",
        "Critic Rating": "94%",
        "Audience Rating": "76%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=m31C9DofmSo",
        "parsedReleaseDate": new Date(2011, 11, 21)
      },
      {
        "Name": "Mission Impossible: Rogue Nation",
        "Release Date": "7/31/2015",
        "Critic Rating": "94%",
        "Audience Rating": "87%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=gOW_azQbOjw",
        "parsedReleaseDate": new Date(2015, 6, 31)
      },
      {
        "Name": "Mission Impossible: Fallout",
        "Release Date": "7/27/2018",
        "Critic Rating": "98%",
        "Audience Rating": "89%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=wb49-oV0F78",
        "parsedReleaseDate": new Date(2018, 6, 27)
      },
      {
        "Name": "Mission Impossible: Dead Reckoning",
        "Release Date": "7/12/2023",
        "Critic Rating": "96%",
        "Audience Rating": "94%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=avz06PDqDbM",
        "parsedReleaseDate": new Date(2023, 6, 12)
      },
      {
        "Name": "Mission Impossible: Final Reckoning",
        "Release Date": "5/23/2025",
        "Critic Rating": "80%",
        "Audience Rating": "88%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=fsQgc9pCyDU",
        "parsedReleaseDate": new Date(2025, 4, 23)
      }
    ];
    
    console.log('Using fallback data');
    cachedMovieData = fallbackData;
    return fallbackData;
  }
};

// Parse release date from string
const parseReleaseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  
  // Try to parse the date in MM/DD/YYYY format
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
  return new Date(0);
};

// Format date for display
export const formatReleaseDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Get upcoming and released movies
export const getMoviesByReleaseStatus = async () => {
  const movies = await loadMovieData();
  const currentDate = new Date();
  
  const upcoming = [];
  const released = [];
  
  movies.forEach(movie => {
    if (movie.parsedReleaseDate > currentDate) {
      upcoming.push(movie);
    } else {
      released.push(movie);
    }
  });
  
  // Sort upcoming movies by release date (earliest first)
  upcoming.sort((a, b) => a.parsedReleaseDate - b.parsedReleaseDate);
  
  // Sort released movies by release date (newest first)
  released.sort((a, b) => b.parsedReleaseDate - a.parsedReleaseDate);
  
  return { upcoming, released };
};

// Convert movie title to image filename
export const getImageFilename = (title) => {
  // Replace spaces with underscores and remove special characters like : and ,
  return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
};

// Get full image path with basePath
export const getImagePath = (filename) => {
  return `${config.basePath}/movieposters/${filename}`;
};
