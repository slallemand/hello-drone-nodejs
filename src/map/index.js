import React, {
    Component
} from 'react';
import cx from "classnames";
import MapGL, {
    NavigationControl,
    FlyToInterpolator,
    Marker
} from 'react-map-gl';
import ControlPanel from './controlPanel';
import FlyToPanel from './flyToPanel';
import CityPin from './cityPin';
import {
    fromJS
} from 'immutable';
import { GuardSpinner } from "react-spinners-kit";
import "./loader.scss";

const navStyle = {
    position: 'absolute',
    bottom: '50px',
    left: 0,
    padding: '10px'
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN
const MAPBOX_STYLE = process.env.REACT_APP_MAPBOX_STYLE
const DEFAULT_EVENT_FOCUS = process.env.REACT_APP_DEFAULT_EVENT_FOCUS
const MAPBOX_DEFAULT_ZOOM_LEVEL = 12
const ZOOM_LEVEL_THRESHOLD_MARKERS = 8

const data = {
    'harvey': [
        {
        value: 'block_1',
        city: 'Houston',
        date: 'August 2017',
        eventName: 'Hurricane Harvey',
        neighborhood: 'Houston East',
        latitude: 29.802,
        longitude: -95.544,
        },
        {
        value: '3020132',
        city: 'Houston',
        date: 'August 2017',
        eventName: 'Hurricane Harvey',
        neighborhood: 'San Jacinto River',
        latitude: 29.830,
        longitude: -95.086,
        },
        {
        value: '3002222',
        city: 'Houston',
        date: 'August 2017',
        eventName: 'Hurricane Harvey',
        neighborhood: 'Thompson Oil Field',
        latitude: 29.488,
        longitude: -95.585,
        }
    ],
    'palu': [
        {
            value: 'palu_1',
            city: 'Palu',
            date: 'August 2018',
            eventName: 'Sulawesi earthquake and tsunami',
            neighborhood: 'Palu',
            latitude: -0.948,
            longitude: 119.934,
        }
    ]
}



let categories = []
let zonesAsPins = []
for (const event in data) {
    categories.push(`${event.toLowerCase()}-flood-extended`)
    categories.push(`${event.toLowerCase()}-roads`)
    data[event].forEach(tile => {
        zonesAsPins.push({
          latitude: tile.latitude,
          longitude: tile.longitude
        });
        categories.push(`${tile.value}-post`)
        categories.push(`${tile.value}-pre`)
    })

}

const controllableLayers = [
    {
        label: 'After event imagery',
        regex: 'post',
        default: true
    },
    {
        label: 'Before event imagery',
        regex: 'pre',
        default: false
    },
    {
        label: 'Extended flood zone',
        regex: 'flood-extended',
        default: true
    },
    {
        label: 'Missing roads',
        regex: 'roads',
        default: true
    }
]

/*
Output
['post', 'pre', 'geojson']
*/
const controllableLayersRegex = controllableLayers.reduce((ac, a) => ([
    ...ac,
    a.regex
]), [])

/* 
Output

const layerSelector = {
    'foo-bar': /foo-bar'
    ...
}

*/
const layerSelector = categories.concat(controllableLayersRegex).reduce((ac, a) => ({
    ...ac,
    [a]: new RegExp(a)
}), {});

const defaultControllableLayers = controllableLayers.filter(controllableLayer => controllableLayer.default).reduce((ac, a) => ([
  ...ac,
  a.regex]), [])

let mapStylesheet = undefined

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: MAPBOX_STYLE,
      viewport: {
        latitude: 29.767,
        longitude: -95.58,
        zoom: MAPBOX_DEFAULT_ZOOM_LEVEL
      },
      visibility: categories.concat(controllableLayersRegex).reduce((ac, a) => {
        if (defaultControllableLayers.every((layer) => !a.includes(layer))) {
          return {
            ...ac,
            [a]: {
              regex: a,
              default: false,
              value: false
            }
          };
        }
        return {
          ...ac,
          [a]: {
            regex: a,
            default: true,
            value: true
          }
        };
      }, {}),
      isFullyLoaded: false
    };
  }

  _renderCityMarker = (zone, index) => {
    return (
      <Marker
        key={`marker-${index}`}
        longitude={zone.longitude}
        latitude={zone.latitude}
      >
        <CityPin size={50}/>
      </Marker>
    );
  };

  _onStyleChange = mapStyle => {
    this.setState({
      mapStyle
    });
  };
  // Watch to visibility.pre / visibility.post / visibility.geojson
  _updateMapStyle = visibility => {
    const layers = mapStylesheet.get("layers").filter(layer => {
      const id = layer.get("id");
      return categories.every(
        name => visibility[name].value || !layerSelector[name].test(id)
      );
    });
    this._onStyleChange(mapStylesheet.set("layers", layers));
  };

  _onVisibilityChange = (name, event) => {
    const visibility = {
      ...this.state.visibility,
      [name]: {
        ...this.state.visibility[name],
        value: event.target.checked
      }
    };
    for (const e in visibility) {
      if (layerSelector[name].test(`-${e}`)) {
        visibility[e] = {
          ...visibility[e],
          value: event.target.checked
        };
      }
    }

    this.setState({ visibility }, () => {
      this._updateMapStyle(visibility);
    });
  };

  _onViewportChange = viewport => {
    const { zoom } = viewport;
    return this.setState({
      viewport: {
        ...this.state.viewport,
        ...viewport
      },
      currentZoom: zoom
    });
  };

  _goToViewport = ({ longitude, latitude }) => {
    this._onViewportChange({
      longitude,
      latitude,
      zoom: MAPBOX_DEFAULT_ZOOM_LEVEL,
      transitionInterpolator: new FlyToInterpolator({
        speed: 1.6
      }),
      transitionDuration: "auto"
    });
  };

  Map = () => {
    const mapRef = React.createRef();
    const onLoad = () => {
      mapStylesheet = fromJS(mapRef.current.style.stylesheet);
      if (mapStylesheet) {
        this.setState(prevState => ({
          ...prevState,
          isFullyLoaded: true
        }));
        this._updateMapStyle(this.state.visibility);
      }
    };
    return (
      <div>
        <div
          className={cx("spinnerContainer", {
            "spinnerContainer--active": !this.state.isFullyLoaded
          })}
        >
          <div className="spinnerUpperTextContainer">
            <span className="spinnerUpperTextContainer--text__app-name">
              DISASTER INSIGHT
            </span>{" "}
            <span className="spinnerUpperTextContainer--text__team-name">
              by AXA REV
            </span>
          </div>
          <div className="spinner">
            <GuardSpinner
              size={90}
              backColor="#FFF"
              frontColor="rgba(#00008F, 0.5)"
              loading={!this.state.isFullyLoaded}
            />
          </div>
          <div className="spinnerLowerTextContainer" />
        </div>
        <MapGL
          width="100vw" // It always override the view(viewport) width state.
          height="100vh" // It always override the view(viewport) height state.
          ref={ref => (mapRef.current = ref && ref.getMap())}
          onLoad={onLoad}
          {...this.state.viewport}
          mapStyle={this.state.mapStyle}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this._onViewportChange}
        >
            {
                this.state.currentZoom < ZOOM_LEVEL_THRESHOLD_MARKERS ? zonesAsPins.map(this._renderCityMarker) : undefined
            }
            <div className="nav" style={navStyle}>
                <NavigationControl showCompass={false} />
            </div>
        </MapGL>
        {this.state.isFullyLoaded ? (
          <ControlPanel
            onChange={this._onVisibilityChange}
            layers={this.state.visibility}
            categories={controllableLayers}
          />
        ) : null}
        {this.state.isFullyLoaded ? (
          <FlyToPanel
            containerComponent={this.props.containerComponent}
            onViewportChange={this._goToViewport}
            defaultEvent={DEFAULT_EVENT_FOCUS.toLowerCase()}
            data={data}
          />
        ) : null}
      </div>
    );
  };

  render() {
    return this.Map();
  }
}

export default Map
