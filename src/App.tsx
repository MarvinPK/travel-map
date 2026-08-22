import { useEffect, useState } from "react";

import WorldMap from "./components/WorldMap";

import type { TravelCountry } from "./types/travel";
import { getVisitedCountries } from "./services/travelApi";

function App() {
  const [travelCountries, setTravelCountries] = useState<TravelCountry[]>([]);

  useEffect(() => {
    getVisitedCountries()
      .then((data) => setTravelCountries(data))
      .catch((error) => {
        console.error("Unable to load visited countries:", error);
      });
  }, []);

  const countryCount = travelCountries.length;

  const continentCount = new Set(
    travelCountries.map((country) => country.continent),
  ).size;

  return (
    <main className="travel-app">
      <header className="travel-header">
        <div>
          <p className="eyebrow">MY JOURNEY</p>
          <h1>World of travels</h1>
        </div>

        <div className="travel-stats">
          <div className="stat">
            <span className="stat-value">{countryCount}</span>

            <span className="stat-label">countries</span>
          </div>

          <div className="stat">
            <span className="stat-value">{continentCount}</span>

            <span className="stat-label">continents</span>
          </div>
        </div>
      </header>

      <section className="map-section">
        <WorldMap travelCountries={travelCountries} />
      </section>

      <footer className="travel-footer">
        <span className="legend-dot" />

        <span>Places I've been</span>

        <span className="footer-separator">•</span>

        <span>Touch a country to explore</span>
      </footer>
    </main>
  );
}

export default App;
