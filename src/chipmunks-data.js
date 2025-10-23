// Function to parse CSV line properly handling commas in URLs
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Function to load and parse CSV data
export const loadMovieData = async () => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL || '.'}/chipmunks/alvin.csv`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('Raw CSV text:', csvText.substring(0, 200) + '...'); // Debug log (first 200 chars)
    
    // Parse CSV - handle both \n and \r\n line endings
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      console.error('CSV file appears to be empty or malformed');
      return [];
    }
    
    // Get headers using proper CSV parsing
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers); // Debug log
    
    // Parse data rows
    const movies = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line);
      console.log(`Row ${index + 1} values:`, values); // Debug log
      
      const movie = {};
      headers.forEach((header, headerIndex) => {
        movie[header] = values[headerIndex] || '';
      });
      
      return movie;
    }).filter(movie => {
      // Filter out empty movies (where the name is empty)
      const hasName = movie['Name'] && movie['Name'].trim() !== '';
      console.log('Movie has name:', hasName, movie['Name']); // Debug log
      return hasName;
    });
    
    console.log('Final loaded movies:', movies); // Debug log
    return movies;
  } catch (error) {
    console.error('Error loading movie data:', error);
    return [];
  }
};

// Helper function to get movie by name
export const getMovieByTitle = async (title) => {
  const movies = await loadMovieData();
  return movies.find(movie => 
    movie['Name']?.toLowerCase().replace(/[^a-z0-9]/g, '') === 
    title.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
};

// Helper function to format movie title for URL
export const formatTitleForUrl = (title) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
};

// Helper function to parse rating
export const parseRating = (rating) => {
  if (!rating || typeof rating !== 'string') {
    return 0;
  }
  
  if (rating.includes('/')) {
    const [num, denom] = rating.split('/');
    return (parseFloat(num) / parseFloat(denom)) * 100;
  }
  return parseFloat(rating.replace('%', ''));
};

// Helper function to get image filename from movie name
export const getImageFilename = (movieName) => {
  if (!movieName) return '';
  return movieName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + '.png';
};

// Helper function to get full image path
export const getImagePath = (movieName) => {
  const filename = getImageFilename(movieName);
  return `${process.env.PUBLIC_URL || '.'}/chipmunks/${filename}`;
};
