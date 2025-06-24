import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { Map, View, Overlay } from 'ol';
import { Tile, Image, Group, Vector } from 'ol/layer';
import { OSM, ImageWMS, XYZ, StadiaMaps } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import { ScaleLine, FullScreen, MousePosition, } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import { createStringXY } from 'ol/coordinate';
import { Style, Fill, Stroke } from 'ol/style';


// OpenStreetMap base map
let osm = new Tile({
    title: "Open Street Map",
    type: "base",
    visible: true,
    source: new OSM()
});

// Colombia Administrative Boundaries
let colombiaBoundary = new Image({
    title: "Colombia Administrative level 0",
    source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: { 'LAYERS': 'EX_ProgettoGIS:France_LC_reclassified_2022' }
    }),
    visible: true
});

// Add the layer groups code here:
let basemapLayers = new Group({
    title: 'Base Maps',
    layers: [osm]
});
let overlayLayers = new Group({
    title: 'Overlay Layers',
    layers: [
        colombiaBoundary,
    ]
});


// Map Initialization
let mapOrigin = fromLonLat([2.7, 46.7]);
let zoomLevel = 6;
let map = new Map({
    target: document.getElementById('map'),
    layers: [basemapLayers, overlayLayers],
    //layers: [],
    view: new View({
        center: mapOrigin,
        zoom: zoomLevel
    }),
    projection: 'EPSG:3857'
});

// Add the map controls here:
map.addControl(new ScaleLine());
map.addControl(new FullScreen());
map.addControl(
    new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-control',
        placeholder: '0.0000, 0.0000'
    })
);


// Add the layer groups to the map here, at the end of the script!
map.addLayer(basemapLayers);
map.addLayer(overlayLayers);
