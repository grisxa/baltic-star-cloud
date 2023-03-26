import {Map} from 'mapbox-gl';

export const drawJsonRoute = (map: Map, geoJSON: any) => {
  if (Object.keys(geoJSON).length) {
    map.addSource('route', {
      type: 'geojson',
      data: geoJSON
    });
    map.addLayer({
      /* eslint @typescript-eslint/naming-convention: "warn" */
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'red',
        'line-width': 2
      }
    });
  }
};
