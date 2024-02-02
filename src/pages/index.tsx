import * as React from 'react'

import mapboxgl from 'mapbox-gl';
import { Modes, Nullable, Line, Point } from '@/shared/type';
import { getCoordinateFromLngLat, getCreatedDate, getNewLine, getNewPoint } from '@/shared/utils';
import { defaultLinePaint, defaultPointPaint, modes } from '@/shared/const';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF4aW1hcnRlbW92IiwiYSI6ImNrNzY1NXM0ODAwcnAzZ21rMGQzZXF0ZGMifQ.cMe-OEKCQ4fItevZ4FLdZg'

const BasePage: React.FC = () => {
  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef<mapboxgl.Map>();

  const map = mapRef.current;

  const [lines, setLines] = React.useState<Array<{
    line: Line,
    callback: (event: mapboxgl.MapMouseEvent) => void
  }>>([]);

  const [points, setPoints] = React.useState<Array<{
    point: Point,
    callback: (event: mapboxgl.MapMouseEvent) => void
  }>>([]);

  const [newLine, setNewLine] = React.useState<Nullable<Line>>(null)

  const [mode, setMode] = React.useState<Nullable<Modes>>(null);

  const deleteGeometry = (id: string) => {
    if (map) {
      const source = map.getSource(id)
      const layer =
        map.getLayer(id)


      if (layer) {
        map.removeLayer(id);
      }

      if (source) {
        map.removeSource(id);
      }
    }
  }

  const drawLine = (line: Line, paint: mapboxgl.LinePaint = defaultLinePaint) => {
    const { properties: {
      id
    } } = line;

    if (map) {
      map.addSource(id, {
        type: 'geojson',
        data: line,
      })

      map.addLayer({
        id,
        type: 'line',
        source: id,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint,
      });
    }
  }

  const drawPoint = (point: Point, paint: mapboxgl.CirclePaint = defaultPointPaint) => {
    const { properties: {
      id
    } } = point;

    if (map) {
      map.addSource(id, {
        type: 'geojson',
        data: point,
      })

      map.addLayer({
        id,
        type: 'circle',
        source: id,
        paint,
      });
    }
  }

  const addNewLine = () => {
    if (newLine && map) {
      const id = newLine.properties.id

      const now = new Date();

      const drawPopup = ({ lngLat }: mapboxgl.MapMouseEvent) => {
        new mapboxgl.Popup()
          .setLngLat(getCoordinateFromLngLat(lngLat))
          .setHTML(`Линия создана: ${getCreatedDate(now)}`)
          .addTo(map);
      }

      setLines((prevState) => [
        ...prevState,
        {
          line: newLine,
          callback: drawPopup
        }
      ])

      setNewLine(getNewLine())

      deleteGeometry(id);
      drawLine(newLine)

      map.on('click', id, drawPopup)
    }
  }

  const addNewPoint = (newCoordinate: number[]) => {
    if (!map) return;

    const newPoint = getNewPoint(newCoordinate)

    const id = newPoint.properties.id;

    const now = new Date();

    const drawPopup = ({ lngLat }: mapboxgl.MapMouseEvent) => {
      new mapboxgl.Popup()
        .setLngLat(getCoordinateFromLngLat(lngLat))
        .setHTML(`Точка создана: ${getCreatedDate(now)}`)
        .addTo(map);
    }


    setPoints(prevState => [
      ...prevState,
      {
        point: newPoint,
        callback: drawPopup
      }
    ])

    deleteGeometry(id);
    drawPoint(newPoint)

    map.on('click', id, drawPopup)
  }

  const handleClickOnMap = ({ lngLat }: mapboxgl.MapMouseEvent) => {
    const newCoordinate = getCoordinateFromLngLat(lngLat);

    switch (mode) {
      case Modes.LINE: {
        setNewLine(prevState => {
          if (prevState) {
            return {
              ...prevState,
              geometry: {
                ...prevState.geometry,
                coordinates: [
                  ...prevState.geometry.coordinates,
                  newCoordinate
                ]
              }
            }
          }

          return prevState
        })

        break;
      }

      case Modes.POINT: {
        addNewPoint(newCoordinate)

        break;
      }
    }
  }

  React.useEffect(() => {
    const mapContainer = mapContainerRef.current

    if (mapRef.current || !mapContainer) return;

    const center: mapboxgl.LngLatLike = [-122.486052, 37.830348]

    mapRef.current = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 14
    });
  }, []);

  React.useEffect(() => {
    if (newLine) {
      const { properties: {
        id
      } } = newLine;

      deleteGeometry(id)

      drawLine(newLine, {
        'line-color': '#000',
        'line-width': 2
      })
    }
  }, [newLine])

  React.useEffect(() => {
    const container = document.querySelector<HTMLDivElement>('.mapboxgl-canvas-container')

    if (container) {
      container.style.cursor = mode ? 'pointer' : 'grab'
    }

    switch (mode) {
      case Modes.LINE: {
        setNewLine(getNewLine());

        break;
      }

      default: {
        if (newLine) {
          deleteGeometry(newLine.properties.id)
          setNewLine(null);
        }
      }
    }

    map?.on('click', handleClickOnMap)

    return () => {
      map?.off('click', handleClickOnMap)
    }
  }, [mode])

  return (
    <div>
      <div ref={mapContainerRef} className="map-container" />

      <div className='control'>
        <div className='buttons'>
          <fieldset className='fieldset' id='edit-mode'>
            <legend>Режими добавления</legend>

            {
              modes.map((_mode) => {
                return (
                  <label key={_mode} className='label'>
                    <input
                      type='checkbox'
                      className='checkbox'
                      name='edit-mode'
                      checked={mode === _mode}
                      onChange={({ target: {
                        checked
                      } }) => {
                        if (checked) {
                          setMode(_mode)
                        } else {
                          setMode(null);
                        }
                      }}
                    />

                    <p>{_mode}</p>
                  </label>
                )
              })
            }
          </fieldset>

          {
            mode === Modes.LINE ? (
              <button
                className='button'
                onClick={addNewLine}
                disabled={(newLine?.geometry.coordinates.length ?? 0) < 2}
              >
                Сохранить новую линию
              </button>
            ) : (
              <button
                className='button'
                onClick={() => {
                  if (!map) return;

                  lines.forEach(({ line, callback }) => {
                    const id = line.properties.id;

                    map.off('click', id, callback)

                    deleteGeometry(id);
                  })

                  setLines([]);
                }}
                disabled={lines.length === 0}
              >
                Удалить все линии
              </button>
            )
          }

          <button
            className='button'
            onClick={() => {
              if (!map) return;

              points.forEach(({ point: {
                properties: {
                  id
                }
              }, callback }) => {
                map.off('click', id, callback)

                deleteGeometry(id)
              })

              setPoints([])
            }}
            disabled={points.length === 0}
          >
            Удалить все точки
          </button>
        </div>

        <div className='buttons'>
          <fieldset className='fieldset' id='show-modes'>
            <legend>Режими показа</legend>

            {
              modes.map((_mode) => {
                return (
                  <label key={_mode} className='label'>
                    <input
                      type='checkbox'
                      className='checkbox'
                      onChange={({ target: {
                        checked
                      } }) => {
                        switch (_mode) {
                          case Modes.LINE: {
                            if (checked) {
                              lines.forEach(({ line }) => {
                                drawLine(line)
                              })
                            } else {
                              lines.forEach(({ line: {
                                properties: {
                                  id
                                }
                              } }) => {
                                deleteGeometry(id)
                              })
                            }

                            break;
                          }

                          case Modes.POINT: {
                            if (checked) {
                              points.forEach(({ point }) => {
                                drawPoint(point)
                              })
                            } else {
                              points.forEach(({ point: {
                                properties: {
                                  id
                                }
                              } }) => {
                                deleteGeometry(id)
                              })
                            }

                            break;
                          }
                        }
                      }}
                      defaultChecked
                    />

                    <p>{_mode}</p>
                  </label>
                )
              })
            }
          </fieldset>
        </div>
      </div>
    </div>
  )
}

export default BasePage
