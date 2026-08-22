import { useEffect, useMemo, useState } from "react";
import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";

import type { TravelCountry } from "../types/travel";

const WIDTH = 1000;
const HEIGHT = 500;

type WorldMapProps = {
  travelCountries: TravelCountry[];
};

type CountryFeature = {
  type: "Feature";
  properties: {
    "ISO3166-1-Alpha-3"?: string;
    ADMIN?: string;
    name?: string;
  };
  geometry: unknown;
};

type CountriesGeoJSON = {
  type: "FeatureCollection";
  features: CountryFeature[];
};

function WorldMap({ travelCountries }: WorldMapProps) {
  const [countries, setCountries] = useState<CountriesGeoJSON | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [mapTransform, setMapTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  useEffect(() => {
    fetch("/countries.geojson")
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) => {
        console.error("Unable to load countries:", error);
      });
  }, []);

  const projection = useMemo(
    () =>
      geoNaturalEarth1()
        .scale(160)
        .translate([WIDTH / 2, HEIGHT / 2]),
    [],
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const countryPaths = useMemo(() => {
    if (!countries) {
      return [];
    }

    return countries.features
      .map((country, index) => {
        const path = pathGenerator(country as any);

        if (!path) {
          return null;
        }

        const countryCode = country.properties["ISO3166-1-Alpha-3"];

        const countryName =
          country.properties.ADMIN ?? country.properties.name ?? "Unknown";

        const travelData = travelCountries.find(
          (travel) => travel.countryCode === countryCode,
        );

        const isVisited = travelData !== undefined;

        /*
         * Centre géographique du pays,
         * puis conversion dans le système
         * de coordonnées SVG.
         */
        const [longitude, latitude] = geoCentroid(country as any);

        const projectedCenter = projection([longitude, latitude]);

        return {
          path,
          countryCode,
          countryName,
          isVisited,
          travelData,
          projectedCenter,
          key: countryCode ?? index,
        };
      })
      .filter(Boolean);
  }, [countries, pathGenerator, projection, travelCountries]);

  const handleCountryClick = (
    countryCode: string | undefined,
    projectedCenter: [number, number] | null | undefined,
  ) => {
    if (!countryCode || !projectedCenter) {
      return;
    }

    const [x, y] = projectedCenter;

    const scale = 2;

    /*
     * On déplace la carte afin que
     * le centre du pays arrive au
     * centre de notre viewport.
     */
    const targetX = WIDTH / 2 - x * scale;

    const targetY = HEIGHT / 2 - y * scale;

    setMapTransform({
      x: targetX,
      y: targetY,
      scale,
    });

    setSelectedCountry(countryCode);
  };

  const resetMap = () => {
    setSelectedCountry(null);

    setMapTransform({
      x: 0,
      y: 0,
      scale: 1,
    });
  };

  if (!countries) {
    return (
      <div className="map-loading">
        <div className="loading-spinner" />

        <span>Loading your journey...</span>
      </div>
    );
  }

  return (
    <div className="world-map-wrapper">
      <svg
        className="world-map"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          className="world-map-content"
          transform={`translate(${mapTransform.x} ${mapTransform.y}) scale(${mapTransform.scale})`}
        >
          {countryPaths.map((country) => {
            if (!country) {
              return null;
            }

            const isSelected = selectedCountry === country.countryCode;

            return (
              <path
                key={country.key}
                d={country.path}
                className={`country ${country.isVisited ? "visited" : ""} ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => {
                  if (country.isVisited) {
                    handleCountryClick(
                      country.countryCode,
                      country.projectedCenter,
                    );
                  }
                }}
              >
                <title>{country.countryName}</title>
              </path>
            );
          })}
        </g>
      </svg>

      {selectedCountry && (
        <div className="country-panel">
          {(() => {
            const country = travelCountries.find(
              (item) => item.countryCode === selectedCountry,
            );

            if (!country) {
              return null;
            }

            return (
              <>
                <button
                  className="country-panel-close"
                  onClick={resetMap}
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="country-panel-flag">{country.flag}</div>

                <p className="country-panel-eyebrow">
                  MY JOURNEY · {country.year}
                </p>

                <h2>{country.name}</h2>

                <p className="country-panel-continent">{country.continent}</p>

                <div className="country-panel-line" />

                <p className="country-panel-description">
                  {country.description}
                </p>

                <button className="explore-button">
                  Explore this journey
                  <span>→</span>
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default WorldMap;
