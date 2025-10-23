import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/star-wars`, // Base path for the project
  csvFileName: 'StarWars.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Star Wars movies CSV file
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
        "Name": "Star Wars: Episode I - The Phantom Menace",
        "Release Date": "5/19/1999",
        "Critic Rating": "52%",
        "Audience Rating": "59%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=bD7bpG-zDJQ",
        "parsedReleaseDate": new Date(1999, 4, 19)
      },
      {
        "Name": "Star Wars: Episode II - Attack of the Clones",
        "Release Date": "5/16/2002",
        "Critic Rating": "65%",
        "Audience Rating": "56%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=gYbW1F_c9eM",
        "parsedReleaseDate": new Date(2002, 4, 16)
      },
      {
        "Name": "Star Wars: Episode III - Revenge of the Sith",
        "Release Date": "5/19/2005",
        "Critic Rating": "79%",
        "Audience Rating": "66%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=5UnjrG_N8hU",
        "parsedReleaseDate": new Date(2005, 4, 19)
      },
      {
        "Name": "Star Wars: Episode IV - A New Hope",
        "Release Date": "5/25/1977",
        "Critic Rating": "93%",
        "Audience Rating": "96%",
        "My Rating": "5/5",
        "Trailer": "https://www.youtube.com/watch?v=vZ734NWnAHA",
        "parsedReleaseDate": new Date(1977, 4, 25)
      },
      {
        "Name": "Star Wars: Episode V - The Empire Strikes Back",
        "Release Date": "5/21/1980",
        "Critic Rating": "94%",
        "Audience Rating": "97%",
        "My Rating": "5/5",
        "Trailer": "https://www.youtube.com/watch?v=JNwNXF9Y6kY",
        "parsedReleaseDate": new Date(1980, 4, 21)
      },
      {
        "Name": "Star Wars: Episode VI - Return of the Jedi",
        "Release Date": "5/25/1983",
        "Critic Rating": "83%",
        "Audience Rating": "94%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=7L8p7_SLzvU",
        "parsedReleaseDate": new Date(1983, 4, 25)
      },
      {
        "Name": "Star Wars: Episode VII - The Force Awakens",
        "Release Date": "12/18/2015",
        "Critic Rating": "93%",
        "Audience Rating": "85%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=sGbxmsDFVnE",
        "parsedReleaseDate": new Date(2015, 11, 18)
      },
      {
        "Name": "Star Wars: Episode VIII - The Last Jedi",
        "Release Date": "12/15/2017",
        "Critic Rating": "91%",
        "Audience Rating": "42%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=Q0CbN8sfihY",
        "parsedReleaseDate": new Date(2017, 11, 15)
      },
      {
        "Name": "Star Wars: Episode IX - The Rise of Skywalker",
        "Release Date": "12/20/2019",
        "Critic Rating": "52%",
        "Audience Rating": "86%",
        "My Rating": "2.5/5",
        "Trailer": "https://www.youtube.com/watch?v=8Qn_spdM5Zg",
        "parsedReleaseDate": new Date(2019, 11, 20)
      },
      {
        "Name": "Rogue One: A Star Wars Story",
        "Release Date": "12/16/2016",
        "Critic Rating": "84%",
        "Audience Rating": "86%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=frdj1zb9sMY",
        "parsedReleaseDate": new Date(2016, 11, 16)
      },
      {
        "Name": "Solo: A Star Wars Story",
        "Release Date": "5/25/2018",
        "Critic Rating": "69%",
        "Audience Rating": "64%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=jPEYpryMp2s",
        "parsedReleaseDate": new Date(2018, 4, 25)
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
