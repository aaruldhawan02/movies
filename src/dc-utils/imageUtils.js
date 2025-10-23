/**
 * Utility functions for handling movie poster images
 */

/**
 * Get the correct base path for movie poster images
 * @returns {string} The base path for images
 */
export const getImageBasePath = () => {
  // In development, use relative path from public folder
  // In production, use the full path with homepage prefix
  return process.env.NODE_ENV === 'production' ? '/posters/' : '/movieposters/';
};

/**
 * Convert movie title to image filename
 * @param {string} title - The movie title
 * @returns {string} The image filename
 */
export const getImageFilename = (title) => {
  // Replace spaces with underscores and remove special characters like : , ? ! ( )
  return title.replace(/ /g, '_').replace(/[:,.?!()]/g, '') + '.png';
};

/**
 * Get the full image URL for a movie
 * @param {string} title - The movie title
 * @returns {string} The full image URL
 */
export const getImageUrl = (title) => {
  return `${getImageBasePath()}${getImageFilename(title)}`;
};
