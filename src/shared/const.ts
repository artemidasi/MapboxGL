import { Modes } from "./type";

import mapboxgl from 'mapbox-gl';

export const modes = [
  Modes.LINE,
  Modes.POINT
]

export const defaultLinePaint: mapboxgl.LinePaint = {
  'line-color': 'red',
  'line-width': 3
}

export const defaultPointPaint: mapboxgl.CirclePaint = {
  'circle-radius': 5,
  'circle-color': 'red'
}