import * as React from 'react'

import mapboxgl from 'mapbox-gl';
import { Nullable } from '@/shared/type';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF4aW1hcnRlbW92IiwiYSI6ImNrNzY1NXM0ODAwcnAzZ21rMGQzZXF0ZGMifQ.cMe-OEKCQ4fItevZ4FLdZg'

const BasePage: React.FC = () => {
  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef<mapboxgl.Map>();

  const [lng, setLng] = React.useState(-70.9);
  const [lat, setLat] = React.useState(42.35);
  const [zoom, setZoom] = React.useState(9);

  React.useEffect(() => {
    const map = mapRef.current;
    const mapContainer = mapContainerRef.current

    if (mapRef.current || !mapContainer) return;

    const test = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    mapRef.current = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });
  });

  return <div>
    <div ref={mapContainerRef} className="map-container" />
  </div>

}

export default BasePage
