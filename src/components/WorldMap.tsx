import { useEffect, useMemo, useRef, useState } from "react";

import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";

import type { TravelCountry } from "../types/travel";

import "./worldMap.css";

const WIDTH = 1000;
const HEIGHT = 500;

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const COUNTRY_SCALE = 2;

type WorldMapProps = {
  travelCountries: TravelCountry[];
  selectedCountry: string | null;
  onCountrySelect: (countryCode: string) => void;
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

type Point = {
  x: number;
  y: number;
};

type MapTransform = {
  x: number;
  y: number;
  scale: number;
};

function WorldMap({
  travelCountries,
  selectedCountry,
  onCountrySelect,
}: WorldMapProps) {
  console.log("render WorldMap");
  const [countries, setCountries] = useState<CountriesGeoJSON | null>(null);

  /**
   * IMPORTANT :
   * La transformation de la carte n'est plus stockée dans le state React.
   *
   * Elle est conservée dans une ref afin que les mouvements / zooms
   * n'entraînent pas de rerender de toute la carte.
   */
  const mapTransformRef = useRef<MapTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  /**
   * Référence directe vers le <g> contenant les pays.
   */
  const mapGroupRef = useRef<SVGGElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const dragStartRef = useRef<Point | null>(null);

  const dragOriginRef = useRef({
    x: 0,
    y: 0,
  });

  const didDragRef = useRef(false);

  const pinchStartRef = useRef<{
    distance: number;
    center: Point;
    transform: MapTransform;
  } | null>(null);

  /**
   * Applique directement la transformation au <g>.
   *
   * Aucun setState React ici.
   */
  const applyMapTransform = (transform: MapTransform) => {
    mapTransformRef.current = transform;

    if (!mapGroupRef.current) {
      return;
    }

    mapGroupRef.current.setAttribute(
      "transform",
      `translate(${transform.x} ${transform.y}) scale(${transform.scale})`,
    );
  };

  useEffect(() => {
    fetch("/countries.geojson")
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) => {
        console.error("Unable to load countries:", error);
      });
  }, []);

  /**
   * Quand aucun pays n'est sélectionné,
   * on revient à la vue monde.
   */
  useEffect(() => {
    if (!selectedCountry) {
      applyMapTransform({
        x: 0,
        y: 0,
        scale: 1,
      });
    }
  }, [selectedCountry]);

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

        /**
         * Centre géographique réel du pays.
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

  /**
   * Conversion coordonnées écran → coordonnées SVG.
   */
  const getSvgPoint = (clientX: number, clientY: number): Point | null => {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();

    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,

      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  /**
   * Zoom autour d'un point donné.
   *
   * La transformation est appliquée directement
   * au DOM sans provoquer de rerender React.
   */
  const zoomAtPoint = (point: Point, newScale: number) => {
    const current = mapTransformRef.current;

    const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const newX = point.x - (point.x - current.x) * (scale / current.scale);

    const newY = point.y - (point.y - current.y) * (scale / current.scale);

    applyMapTransform({
      x: newX,
      y: newY,
      scale,
    });
  };

  /**
   * Zoom automatique lorsqu'on sélectionne
   * un pays.
   */
  const handleCountryClick = (
    countryCode: string | undefined,
    projectedCenter: [number, number] | null | undefined,
  ) => {
    /**
     * Empêche un clic parasite après un drag.
     */
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    if (!countryCode || !projectedCenter) {
      return;
    }

    const [x, y] = projectedCenter;

    const targetX = WIDTH / 2 - x * COUNTRY_SCALE;

    const targetY = HEIGHT / 2 - y * COUNTRY_SCALE;

    /**
     * Transformation directe du SVG.
     */
    applyMapTransform({
      x: targetX,
      y: targetY,
      scale: COUNTRY_SCALE,
    });

    /**
     * Ouverture du panel via React.
     *
     * Le panel peut maintenant être rendu
     * sans attendre un rerender de toute la carte.
     */
    onCountrySelect(countryCode);
  };

  /**
   * -------------------------
   * SOURIS
   * -------------------------
   */

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.button !== 0) {
      return;
    }

    const point = getSvgPoint(event.clientX, event.clientY);

    if (!point) {
      return;
    }

    dragStartRef.current = point;

    dragOriginRef.current = {
      x: mapTransformRef.current.x,
      y: mapTransformRef.current.y,
    };

    didDragRef.current = false;

    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStartRef.current) {
      return;
    }

    const point = getSvgPoint(event.clientX, event.clientY);

    if (!point) {
      return;
    }

    const deltaX = point.x - dragStartRef.current.x;

    const deltaY = point.y - dragStartRef.current.y;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      didDragRef.current = true;
    }

    applyMapTransform({
      x: dragOriginRef.current.x + deltaX,

      y: dragOriginRef.current.y + deltaY,

      scale: mapTransformRef.current.scale,
    });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    setIsDragging(false);
  };

  /**
   * Zoom avec la molette.
   */
  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();

    const point = getSvgPoint(event.clientX, event.clientY);

    if (!point) {
      return;
    }

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;

    zoomAtPoint(point, mapTransformRef.current.scale * zoomFactor);
  };

  /**
   * -------------------------
   * TACTILE
   * -------------------------
   */

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX;

    const dy = touch2.clientY - touch1.clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (
    touch1: React.Touch,
    touch2: React.Touch,
  ): Point | null => {
    return getSvgPoint(
      (touch1.clientX + touch2.clientX) / 2,

      (touch1.clientY + touch2.clientY) / 2,
    );
  };

  const handleTouchStart = (event: React.TouchEvent<SVGSVGElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];

      const point = getSvgPoint(touch.clientX, touch.clientY);

      if (!point) {
        return;
      }

      dragStartRef.current = point;

      dragOriginRef.current = {
        x: mapTransformRef.current.x,
        y: mapTransformRef.current.y,
      };

      didDragRef.current = false;

      setIsDragging(true);

      return;
    }

    if (event.touches.length === 2) {
      const touch1 = event.touches[0];

      const touch2 = event.touches[1];

      const center = getTouchCenter(touch1, touch2);

      if (!center) {
        return;
      }

      pinchStartRef.current = {
        distance: getTouchDistance(touch1, touch2),

        center,

        transform: {
          ...mapTransformRef.current,
        },
      };

      didDragRef.current = true;
    }
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    /**
     * PINCH
     */
    if (event.touches.length === 2 && pinchStartRef.current) {
      const touch1 = event.touches[0];

      const touch2 = event.touches[1];

      const distance = getTouchDistance(touch1, touch2);

      const zoomRatio = distance / pinchStartRef.current.distance;

      const startTransform = pinchStartRef.current.transform;

      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, startTransform.scale * zoomRatio),
      );

      const center = pinchStartRef.current.center;

      const newX =
        center.x -
        (center.x - startTransform.x) * (newScale / startTransform.scale);

      const newY =
        center.y -
        (center.y - startTransform.y) * (newScale / startTransform.scale);

      applyMapTransform({
        x: newX,
        y: newY,
        scale: newScale,
      });

      return;
    }

    /**
     * DRAG TACTILE
     */
    if (event.touches.length === 1 && dragStartRef.current) {
      const touch = event.touches[0];

      const point = getSvgPoint(touch.clientX, touch.clientY);

      if (!point) {
        return;
      }

      const deltaX = point.x - dragStartRef.current.x;

      const deltaY = point.y - dragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        didDragRef.current = true;
      }

      applyMapTransform({
        x: dragOriginRef.current.x + deltaX,

        y: dragOriginRef.current.y + deltaY,

        scale: mapTransformRef.current.scale,
      });
    }
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
    pinchStartRef.current = null;

    setIsDragging(false);
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
        ref={svgRef}
        className={`world-map ${isDragging ? "is-dragging" : ""}`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <g
          ref={mapGroupRef}
          className="world-map-content"
          transform="translate(0 0) scale(1)"
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
    </div>
  );
}

export default WorldMap;
