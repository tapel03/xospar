// Free map tiles from OpenFreeMap (openfreemap.org): no sign-in, no API key.
// The data comes from OpenStreetMap, so keep the small attribution the map shows.

// pitch = tilt in degrees (0 looks straight down), bearing = rotation in degrees.
export const HOME = { center: [20, 30], zoom: 1.6, pitch: 30, bearing: 0 };
export const MIN_Z = 1;
export const MAX_Z = 18;
export const MAX_PITCH = 75;

// The "Liberty" style: orange roads, green parks, blue water, city labels and 3D buildings.
// Every map (web, Expo Go and native builds) uses this one style.
export const LIGHT_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const MAP_STYLE_URL = LIGHT_STYLE_URL;

// Kept only so older imports do not break. It is no longer used.
export const darkStyle = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': '#1A1F1F' } },
    { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': '#090B0B' } },
  ],
};