import type { TravelCountry } from "../types/travel";

type CountryPanelProps = {
  country: TravelCountry | null;
  onClose: () => void;
};

function CountryPanel({
  country,
  onClose,
}: CountryPanelProps) {
  if (!country) {
    return null;
  }

  return (
    <div className="country-panel">
      <button
        className="country-panel-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      <div className="country-panel-flag">
        {country.flag}
      </div>

      <p className="country-panel-eyebrow">
        MY JOURNEY · {country.year}
      </p>

      <h2>{country.name}</h2>

      <p className="country-panel-continent">
        {country.continent}
      </p>

      <div className="country-panel-line" />

      <p className="country-panel-description">
        {country.description}
      </p>

      <button className="explore-button">
        Explore this journey
        <span>→</span>
      </button>
    </div>
  );
}

export default CountryPanel;