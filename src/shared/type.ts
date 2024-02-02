export type Nullable<T> = null | T
export type NOOP = () => void;


export enum Modes {
  LINE = 'Линейная геометрия',
  POINT = 'Точечная геометрия'
}

export interface Line extends GeoJSON.Feature<GeoJSON.LineString, {
  id: string
}> {}

export interface Point extends GeoJSON.Feature<GeoJSON.Point, {
  id: string
}> { }