import type { TravelCountry } from "../types/travel";
import "./countryPanel.css";
import { useEffect, useState } from "react";

type CountryPanelProps = {
  country: TravelCountry | null;
  onClose: () => void;
};

function CountryPanel({ country, onClose }: CountryPanelProps) {
  if (!country) {
    return null;
  }

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = country.photos ?? [];
  const currentPhoto = photos[currentPhotoIndex];

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [country.countryCode]);

  return (
    <aside className="country-panel">
      <button
        className="country-panel-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      {currentPhoto ? (
        <div className="country-panel-gallery">
          <img
            key={currentPhoto.id}
            src={currentPhoto.url}
            alt={currentPhoto.caption ?? country.name}
            className="country-panel-gallery-image"
          />

          <div className="country-panel-cover-overlay" />

          {photos.length > 1 && (
            <>
              <button
                className="gallery-arrow gallery-arrow-left"
                onClick={() =>
                  setCurrentPhotoIndex(
                    (currentPhotoIndex - 1 + photos.length) % photos.length,
                  )
                }
                aria-label="Previous photo"
              >
                ‹
              </button>

              <button
                className="gallery-arrow gallery-arrow-right"
                onClick={() =>
                  setCurrentPhotoIndex((currentPhotoIndex + 1) % photos.length)
                }
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {photos.length > 1 && (
            <div className="gallery-dots">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  className={`gallery-dot ${
                    index === currentPhotoIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                  aria-label={`Photo ${index + 1}`}
                />
              ))}
            </div>
          )}

          {currentPhoto.caption && (
            <div className="gallery-caption">
              <span>{currentPhoto.caption}</span>

              {currentPhoto.location && <span>· {currentPhoto.location}</span>}
            </div>
          )}
        </div>
      ) : country.coverImage ? (
        <div className="country-panel-cover">
          <img src={country.coverImage} alt={country.name} />

          <div className="country-panel-cover-overlay" />
        </div>
      ) : null}

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
