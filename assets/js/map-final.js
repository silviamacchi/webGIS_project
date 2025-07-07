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
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm0' }
    }),
    visible: false
});

// Colombia Administrative level 1
var colombiaDepartments = new Image({
    title: "Colombia Administrative level 1",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm1' }
    }),
    opacity: 0.5,
    visible: false
});

// Colombia Roads
var colombiaRoads = new Image({
    title: "Colombia Roads",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_roads' }
    }),
    visible: false
});

// Colombia Rivers
var colombiaRivers = new Image({
    title: "Colombia Rivers",
    type: "overlay",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_rivers' }
    }),
    visible: false,
    minResolution: 1000,
    maxResolution: 5000
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
        colombiaDepartments,
        colombiaRivers,
        colombiaRoads
    ]
});


// Map Initialization
let mapOrigin = fromLonLat([-74, 4.6]);
let zoomLevel = 5;
let map = new Map({
    target: document.getElementById('map'),
    //layers: [basemapLayers, overlayLayers],
    layers: [],
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

// Add the LayerSwitcher control here:
var layerSwitcher = new LayerSwitcher({});
map.addControl(layerSwitcher);

// Add the Stadia Basemaps here:
var stamenWatercolor = new Tile({
    title: 'Stamen Watercolor',
    type: 'base',
    visible: false,
    source: new StadiaMaps({
        layer: 'stamen_watercolor'
    })
});
var stamenToner = new Tile({
    title: 'Stamen Toner',
    type: 'base',
    visible: false,
    source: new StadiaMaps({
        layer: 'stamen_toner'
    })
});
basemapLayers.getLayers().extend([stamenWatercolor, stamenToner]);

// Add the ESRI XYZ basemaps here:
var esriTopoBasemap = new Tile({
    title: 'ESRI Topographic',
    type: 'base',
    visible: false,
    source: new XYZ({
        attributions:
            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
});
var esriWorldImagery = new Tile({
    title: 'ESRI World Imagery',
    type: 'base',
    visible: false,
    source: new XYZ({
        attributions:
            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Imagery/MapServer">ArcGIS</a>',
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Imagery/MapServer/tile/{z}/{y}/{x}',
    }),
});
basemapLayers.getLayers().extend([
    esriTopoBasemap, esriWorldImagery
]);

// Add the WFS layer here:
// First, the URL definition:
var wfsUrl = "https://www.gis-geoserver.polimi.it/geoserver/gis/wfs?" + 
"service=WFS&" + 
"version=2.0.0&" +
"request=GetFeature&" + 
"typeName=gis:COL_water_areas&" + 
"srsname=EPSG:3857&" + 
"outputFormat=application/json";
// Then the Source and Layer definitions:
let wfsSource = new VectorSource({});
let wfsLayer = new Vector({
    title: "Colombia Water Areas",
    source: wfsSource,
    visible: true,
    style: new Style({
        fill: new Fill({
            color: "#bde0fe"
        }),
        stroke: new Stroke({
            width: 2,
            color: "#a2d2ff"
        })
    })
});

// Finally the call to the WFS service:
fetch(wfsUrl)
.then((response) => {
    if (!response.ok) {
        throw new Error('Error ' + response.statusText);
    }
    response.json().then(data => {
        wfsSource.addFeatures(
	    new GeoJSON().readFeatures(data)
	);
    })
});
overlayLayers.getLayers().extend([wfsLayer]);

// Add the local static GeoJSON layer here:
let staticGeoJSONSource = new VectorSource({
    url: '../geojson/COL_adm2.geojson', 
    format: new GeoJSON()
});
let staticGeoJSONLayer = new Vector({
    title: "Colombia Municipalities",
    source: staticGeoJSONSource,
    style: new Style({
        fill: new Fill({
            color: "rgba(255, 127, 80, 0.5)"
        }),
        stroke: new Stroke({
            width: 2,
            color: "#ff7f50"
        })
    })
});
overlayLayers.getLayers().push(staticGeoJSONLayer);

// Add the popup code here:
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var popup = new Overlay({
    element: container
}); 

map.addOverlay(popup);

closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur(); 
    return false;
};


// Add the singleclick event code here
map.on('singleclick', function (event) {
    var feature = map.forEachFeatureAtPixel(
        event.pixel, 
        function (feature, layer) {
            if(layer == staticGeoJSONLayer){
                return feature;
            }
        }
    );

    if (feature != null) {
        var pixel = event.pixel;
        var coord = map.getCoordinateFromPixel(pixel);
        popup.setPosition(coord);

        content.innerHTML =
            '<h5>Administrative Level 2</h5><br>' +
            '<span>' +
            feature.get('name_2') + ', ' +
            feature.get('name_1')
            '</span>';
    }
});

// Add the pointermove event code here:
map.on('pointermove', function(event) {
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});

// Add the legend code here:
var legendHTMLString = '<ul>';
function getLegendElement(title, color){
    return '<li>' + 
        '<span class="legend-color" style="background-color: ' + color + ' ">' + 
        '</span><span>' + 
        title +
        '</span></li>';
}

for(let overlayLayer of overlayLayers.getLayers().getArray()){
    if(overlayLayer.getSource() instanceof ImageWMS){
        var legendURLParams = {format: "application/json"};
        var legendUrl = overlayLayer.getSource().getLegendUrl(0, legendURLParams);
        // make the legend JSON request
        await fetch(legendUrl).then(async (response) => {
            await response.json().then((data) => {
                var layerTitle = overlayLayer.get('title');
                var layerSymbolizer = data["Legend"][0]["rules"][0]["symbolizers"][0];
                var layerColor = null;
                if("Polygon" in layerSymbolizer){
                    layerColor = layerSymbolizer["Polygon"]["fill"];
                } else if("Line" in layerSymbolizer){
                    layerColor = layerSymbolizer["Line"]["stroke"];
                }

                if(layerColor != null){
                    legendHTMLString += getLegendElement(layerTitle, layerColor);
                }
            });
        });

    } else {
        var layerStyle = overlayLayer.getStyle();
        var layerColor = layerStyle.getFill().getColor();
        var layerTitle = overlayLayer.get('title');
        legendHTMLString += getLegendElement(layerTitle, layerColor);
    }
}
// Finish building the legend HTML string
var legendContent = document.getElementById('legend-content');
legendHTMLString += "</ul>";
legendContent.innerHTML = legendHTMLString;

// Add the layer groups to the map here, at the end of the script!
map.addLayer(basemapLayers);
map.addLayer(overlayLayers);
