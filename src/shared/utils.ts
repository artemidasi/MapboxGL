import uuid from 'react-uuid'
import { Modes, Line, Point } from './type'

export const getNewLine = () => {
  const id = `${Modes.LINE}-${uuid()}`;

  const newLine: Line = {
    type: 'Feature',
    properties: {
      id
    },
    geometry: {
      type: 'LineString',
      coordinates: [],
    }
  }

  return newLine
}

export const getNewPoint = (coordinates: number[]) => {
  const id = `${Modes.POINT}-${uuid()}`;

  const newLine: Point = {
    type: 'Feature',
    properties: {
      id
    },
    geometry: {
      type: 'Point',
      coordinates,
    }
  }

  return newLine
}

export const getCreatedDate = (date: Date = new Date()) => {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export const getCoordinateFromLngLat = (lngLat: mapboxgl.LngLat) => {
  const coordinate: [number, number] = [lngLat.lng, lngLat.lat];

  return coordinate
}