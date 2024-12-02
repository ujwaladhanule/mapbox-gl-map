import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Your Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);

  const generateSessionToken = async () => {
    const res = await fetch(
      `${process.env.REact_APP_GOOGLE_MAP_TILE_URL}/createSession?key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapType: "terrain",
          language: "en-US",
          region: "US",
          layerTypes: ["layerRoadmap"],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Error creating session:', data.error.message);
      return null;
    }

    console.log('Session Token:', data.session);
    return data.session;
  };

  useEffect(() => {
    const myMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [], },
      zoom: 9,
      center: [-74.5, 40],
    });

    myMap.on("load", async () => {
      try {
        const resultPayload = await generateSessionToken();

        myMap.addSource("google-terrain-tile-source", {
          type: "raster",
          tiles: [
            `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${resultPayload}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
          ],
          tileSize: 256,
          attribution: '<a href="https://www.google.com/intl/en-US_US/help/terms_maps.html">Google Maps</a>',
        });

        myMap.addLayer({
          id: "google-terrain-tile",
          type: "raster",
          source: "google-terrain-tile-source",
        });
      } catch (err) {
        console.error("Error --", err);
      }
    });

    return () => myMap.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "70%", height: "600px" }} />;
};

export default Map;
