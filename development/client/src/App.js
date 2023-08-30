import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ColorSchemeGenerator from "./ColorSchemeGenerator";
import Favorites from "./Favorites";
import ColorLookup from "./ColorLookup";
import { GET_SAVED_COLORS } from "./queries";
import "./App.css";

function App() {
  useQuery(GET_SAVED_COLORS);

  return (
    <Router>
      <div className="App">
        <header>
          <Link to="/">
            <h1>Colors</h1>
          </Link>
          <nav>
            <Link to="/favorites">Favorites</Link>
            <Link to="/lookup">Lookup</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/lookup" element={<ColorLookup />} />
            <Route path="/" element={<ColorSchemeGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
