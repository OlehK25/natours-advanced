import { Types as mapboxgl } from "mongoose";

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoib2xlaC1kZXYyNSIsImEiOiJjbGlibHA4ZGswZXRnM2VtdW1jNDR6d2Z1In0.sjD_HzlCQaiQwfugfo3srA";

  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/oleh-dev25/clibn1ma200yr01pg8oqlc7yj",
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 2,
  });

  // Add event listener for 'load' event
  map.on("load", function () {
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
      // Create marker
      const el = document.createElement("div");
      el.className = "marker";

      // Add marker
      new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(loc.coordinates)
        .addTo(map);

      // Add popup
      new mapboxgl.Popup({
        offset: 30,
      })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

      // Extend map bounds to include current locations
      bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100,
      },
    });
  });
};
