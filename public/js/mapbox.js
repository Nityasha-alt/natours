/* eslint-disable */
export const displayMap = (locations) => {
  const scrollY = window.scrollY;

  mapboxgl.accessToken =
    'pk.eyJ1Ijoibml0eWFzaGEtbWFsaWsiLCJhIjoiY21iOHdsazk5MDNxdzJqc2lob3Rycmk1eSJ9.yDJn_sXaXqMfSKrdvAoKaQ';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/nityasha-malik/cmb8xmwfy00sz01sd91t2499v', // style URL
    scrollZoom: false,
    // zoom: 9, // starting zoom
    //   center: [-118.113491, 34.111745],
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
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

    // Extend map bounds to include current location
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
  window.scrollTo(0, scrollY);
};
