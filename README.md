# Movie Collections Hub

A personal movie review and collection website showcasing Aarul Dhawan's opinions on various movie franchises and series.

## About

This website serves as a comprehensive hub for movie collections, featuring detailed reviews, ratings, and information about popular movie franchises including Marvel, DC, Star Wars, Mission Impossible, Fast & Furious, and many more.

## Features

- **Multiple Movie Collections**: Browse through various movie franchises and series
- **Detailed Movie Pages**: Each movie includes ratings, release dates, trailers, and personal reviews
- **Interactive Design**: Clickable collection cards with themed styling
- **Responsive Layout**: Works on desktop and mobile devices
- **Personal Ratings**: Features critic ratings, audience ratings, and personal star ratings

## Collections Included

- Marvel Movies
- DC Movies  
- Star Wars
- Mission Impossible
- Fast & Furious Saga
- Harry Potter
- Pixar Films
- Transformers
- Godzilla
- YRF Spy Universe
- The Boys
- Rocky/Creed
- Karate Kid/Cobra Kai
- Chipmunks
- Despicable Me
- Men in Black

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

- `/src/pages/` - Collection overview pages
- `/src/[collection]-pages/` - Individual movie pages for each collection
- `/public/posters/` - Movie poster images
- `/public/[collection]/` - Collection-specific data files (CSV format)

## Data Format

Movie data is stored in CSV files with the following structure:
- Name
- Release Date
- Critic Rating
- Audience Rating
- My Rating
- Trailer (YouTube URL)

## Technologies Used

- React
- React Router
- Papa Parse (CSV parsing)
- CSS3 with custom styling
- Georgia font family

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
