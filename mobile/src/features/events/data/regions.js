// Highlighted areas for events. Rough hand-drawn shapes for the demo.
// Later: replace with real country / province borders from Natural Earth (naturalearthdata.com).
// Coordinates are [longitude, latitude].

export const SEV_COLOR = { High: '#FF5F6D', Medium: '#F5B54A', Low: '#8C9696' };

const poly = (ring) => ({ type: 'Polygon', coordinates: [ring] });
const box = (w, s, e, n) => poly([[w, s], [e, s], [e, n], [w, n], [w, s]]);

// Keyed by event id from data/mock.js (mapEvents).
const SHAPES = {
  m1: poly([[34.2, 29.5], [35.9, 29.6], [36.9, 31.5], [37.2, 33.8], [36.2, 36.4], [35.0, 35.9], [34.6, 33.4], [34.2, 31.3], [34.2, 29.5]]), // Eastern Mediterranean
  m5: box(-80.2, 8.7, -79.2, 9.6), // Panama Canal
  m6: box(119.8, 13.5, 122.6, 18.9), // Luzon
  m7: box(117.8, 22.4, 122.3, 25.9), // Taiwan Strait
  m8: box(-71.0, -25.6, -68.4, -22.0), // Antofagasta
};

/** GeoJSON the map draws as shaded areas. Only events that have a shape get one. */
export function regionCollection(events) {
  return {
    type: 'FeatureCollection',
    features: events.filter((e) => SHAPES[e.id]).map((e) => ({
      type: 'Feature',
      properties: { id: e.id, severity: e.severity, color: SEV_COLOR[e.severity] || SEV_COLOR.Low },
      geometry: SHAPES[e.id],
    })),
  };
}