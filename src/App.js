import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watchlist from './pages/Watchlist';
import Movies from './pages/Movies';
import NonFranchiseMoviePage from './pages/NonFranchiseMoviePage';
import MarvelMovies from './pages/MarvelMovies';
import FastSaga from './pages/FastSaga';
import Pixar from './pages/Pixar';
import DCMovies from './pages/DCMovies';
import Transformers from './pages/Transformers';
import Godzilla from './pages/Godzilla';
import MenInBlack from './pages/MenInBlack';
import Rocky from './pages/Rocky';
import HarryPotter from './pages/HarryPotter';
import MissionImpossible from './pages/MissionImpossible';
import StarWars from './pages/StarWars';
import YRFSpyUniverse from './pages/YRFSpyUniverse';
import DespicableMe from './pages/DespicableMe';
import KarateKid from './pages/KarateKid';
import TheBoys from './pages/TheBoys';
import Chipmunks from './pages/Chipmunks';
import './App.css';

function App() {
  return (
    <Router basename="/movies">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/non-franchise/movie/:movieTitle" element={<NonFranchiseMoviePage />} />
        <Route path="/marvel-movies/*" element={<MarvelMovies />} />
        <Route path="/fast-saga/*" element={<FastSaga />} />
        <Route path="/pixar/*" element={<Pixar />} />
        <Route path="/dc-movies/*" element={<DCMovies />} />
        <Route path="/transformers/*" element={<Transformers />} />
        <Route path="/godzilla/*" element={<Godzilla />} />
        <Route path="/meninblack/*" element={<MenInBlack />} />
        <Route path="/rocky/*" element={<Rocky />} />
        <Route path="/harrypotter/*" element={<HarryPotter />} />
        <Route path="/mission-impossible/*" element={<MissionImpossible />} />
        <Route path="/star-wars/*" element={<StarWars />} />
        <Route path="/yrf-spy-universe/*" element={<YRFSpyUniverse />} />
        <Route path="/despicable-me/*" element={<DespicableMe />} />
        <Route path="/karate-kid/*" element={<KarateKid />} />
        <Route path="/theboys/*" element={<TheBoys />} />
        <Route path="/chipmunks/*" element={<Chipmunks />} />
      </Routes>
    </Router>
  );
}

export default App;
