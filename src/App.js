import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Watchlist from './pages/Watchlist';
import Movies from './pages/Movies';
import NonFranchiseMoviePage from './pages/NonFranchiseMoviePage';
import MarvelMovies from './pages/MarvelMovies';
import DCMovies from './pages/DCMovies';
import './App.css';

function App() {
  return (
    <Router basename="/movies">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/non-franchise/movie/:movieTitle" element={<NonFranchiseMoviePage />} />
        <Route path="/marvel-movies/*" element={<MarvelMovies />} />
        <Route path="/dc-movies/*" element={<DCMovies />} />
      </Routes>
    </Router>
  );
}

export default App;
