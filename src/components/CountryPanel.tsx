import type { TravelCountry } from "../types/travel";

type CountryPanelProps = {
  country: TravelCountry | null;
  onClose: () => void;
};

function CountryPanel({ country, onClose }: CountryPanelProps) {
  if (!country) {
    return null;
  }

  return (
    <aside className="country-panel">
      <button
        className="country-panel-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      {country.coverImage && (
        <div className="country-panel-cover">
          <img src={country.coverImage} alt={country.name} />

          <div className="country-panel-cover-overlay" />
        </div>
      )}

      <div className="country-panel-content">
        <div className="country-panel-heading">
          <span className="country-panel-flag">{country.flag}</span>

          <div>
            <p className="country-panel-eyebrow">MY JOURNEY · {country.year}</p>

            <h2>{country.name}</h2>

            <p className="country-panel-continent">{country.continent}</p>
          </div>
        </div>

        <div className="country-panel-line" />

        <p className="country-panel-description">{country.description}</p>

        {country.locations && country.locations.length > 0 && (
          <div className="country-locations">
            <p className="country-section-title">PLACES I DISCOVERED</p>

            <div className="country-location-list">
              {country.locations.map((location) => (
                <div key={location.name} className="country-location">
                  <span className="location-dot" />

                  <div>
                    <h3>{location.name}</h3>

                    {location.description && <p>{location.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="explore-button">
          Explore this journey
          <span>→</span>
        </button>
      </div>
    </aside>
  );
}

export default CountryPanel;
