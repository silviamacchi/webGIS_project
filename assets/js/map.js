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

// Land cover
let Land_cover = new Image({
    title: "Land Cover 6 classes",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_LC_reclassified_2022' }
    }),
    visible: false
});

// no2 Bivariate
let no2bivariate = new Image({
    title: "Bivariate map no2",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_no2_2020_bivariate' }
    }),
    visible: false
});

// pm2p5 Bivariate
let pm2p5bivariate = new Image({
    title: "Bivariate map pm2p5",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_pm2p5_2020_bivariate' }
    }),
    visible: false
});

// pm10 Bivariate
let pm10bivariate = new Image({
    title: "Bivariate map pm10",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_pm10_2020_bivariate' }
    }),
    visible: false
});


// Add the layer groups code here:
let basemapLayers = new Group({
    title: 'Base Maps',
    fold: 'close',
    layers: [osm]
});
let overlayLayers = new Group({
    title: 'Overlay Layers',
    fold: 'open',
    layers: [
        new Group({
            title: 'Bivariate Map',
            fold: 'close',
            visible: false,
            layers: [
                no2bivariate,
                pm2p5bivariate,
                pm10bivariate,
            ]
        }),
        new Group({
            title: 'Annual average concentration',
            fold: 'close',
            layers: []
        }),
        new Group({
            title: 'Five years difference from 2017 to 2022',
            fold: 'close',
            layers: []
        }),
        Land_cover,
    ]
});

// Map Initialization
let mapOrigin = fromLonLat([2, 46]);
let zoomLevel = 6;
let map = new Map({
    target: document.getElementById('map'),
    //layers: [basemapLayers, overlayLayers],
    layers: [],
    view: new View({
        center: mapOrigin,
        zoom: zoomLevel
    }),
    projection: 'EPSG:4326'
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

// Add the local static GeoJSON layer here:
let staticGeoJSONSource = new VectorSource({
    url: '../geojson/France_boundaries.geojson', 
    format: new GeoJSON()
});
let staticGeoJSONLayer = new Vector({
    title: "France boundaries",
    source: staticGeoJSONSource,
    style: new Style({
        fill: new Fill({
            color: "rgba(0, 0, 0, 0)"
        }),
        stroke: new Stroke({
            width: 2,
            color: "rgba(55, 60, 153, 1)"
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
            '<h5>France administrative boundary</h5><br>';
    }
});

// Add the pointermove event code here:
map.on('pointermove', function(event) {
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});

//build the legend

function getLegendElement(title, color) {
    return '<li>' + 
        '<span class="legend-color" style="background-color: ' + color + ';"></span>' +
        '<span>' + title + '</span></li>';
}
async function updateLegend() {
    let localLegendHTML = '<ul>';
    async function processLayer(layer) {
        if (layer instanceof Group) {
            const subLayers = layer.getLayers().getArray();
            for (let subLayer of subLayers) {
                await processLayer(subLayer);
            }
        } else if (!layer.getVisible()) {
            return;
        } else if (layer.getSource && layer.getSource() instanceof ImageWMS) {
            const layerTitle = layer.get('title') || 'Untitled';
            localLegendHTML += getLegendElement(layerTitle, null);

        } else {
            var layerStyle = layer.getStyle();
            var layerColor = layerStyle["stroke"];
            var layerTitle = layer.get('title');
            localLegendHTML += getLegendElement(layerTitle, layerColor);
        }
    }

    await processLayer(overlayLayers);
    localLegendHTML += '</ul>';
    const legendContent = document.getElementById('legend-content');
    if (legendContent) {
        legendContent.innerHTML = localLegendHTML;
    }
}

function addVisibilityListeners(groupLayer) {
    const layers = groupLayer.getLayers().getArray();
    for (let layer of layers) {
        if (layer instanceof Group) {
            addVisibilityListeners(layer); // ricorsione nei gruppi
        }

        layer.on('change:visible', () => {
            updateLegend(); // aggiorna la legenda quando cambia visibilità
        });
    }
}

// Add the layer groups to the map here, at the end of the script!
map.addLayer(basemapLayers);
map.addLayer(overlayLayers);
addVisibilityListeners(overlayLayers);
updateLegend();


/* WORKING VERSION
async function processLayer(layer) {
    if (layer instanceof Group) {
        const subLayers = layer.getLayers().getArray();
        for (let subLayer of subLayers) {
            await processLayer(subLayer); // ricorsione
        }
    } else if (layer.getSource && layer.getSource() instanceof ImageWMS) {
        try {
            const legendUrl = layer.getSource().getLegendUrl(0, { format: "application/json" });
            const response = await fetch(legendUrl);
            const data = await response.json();
            const layerTitle = layer.get('title') || 'Untitled';
            const symbolizer = data["Legend"][0]["rules"][0]["symbolizers"][0];
            let layerColor = null;

            if (symbolizer.Polygon) {
                layerColor = symbolizer.Polygon.fill;
            } else if (symbolizer.Line) {
                layerColor = symbolizer.Line.stroke;
            }

            if (layerColor) {
                legendHTMLString += getLegendElement(layerTitle, layerColor);
            }
        } catch (e) {
            console.warn("Legend fetch failed for", layer.get('title'), e);
        }
    } else {

        const layerStyle = layer.getStyle ? layer.getStyle() : null;
        let layerColor = null;
        if (layerStyle && typeof layerStyle.getFill === "function") {
            const fill = layerStyle.getFill();
            if (fill && typeof fill.getColor === "function") {
                layerColor = fill.getColor();
            }
        }
        const layerTitle = layer.get('title') || 'Untitled';
        if (layerColor) {
            legendHTMLString += getLegendElement(layerTitle, layerColor);
        }

        var layerStyle = layer.getStyle();
        //var layerColor = layerStyle.getFill().getColor();
        var layerColor = layerStyle["stroke"];
        var layerTitle = layer.get('title');
        legendHTMLString += getLegendElement(layerTitle, layerColor);
    }
}
*/

/*
// Add the legend code here:
var legendHTMLString = '<ul>';
function getLegendElement(title, color){
    return '<li>' + 
        '<span class="legend-color" style="background-color: ' + color + ' ">' + 
        '</span><span>' + 
        title +
        '</span></li>';
}

async function processLayer(layer) {
    if (layer instanceof ol.layer.Group) {
        const subLayers = layer.getLayers().getArray();
        for (let subLayer of subLayers) {
            await processLayer(subLayer); // ricorsione
        }
    } else if (layer.getSource && layer.getSource() instanceof ImageWMS){
        var legendURLParams = {format: "application/json"};
                var legendUrl = layer.getSource().getLegendUrl(0, legendURLParams);
                // make the legend JSON request
                await fetch(legendUrl).then(async (response) => {
                    await response.json().then((data) => {
                        var layerTitle = layer.get('title');
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
    }else {
        var layerStyle = layer.getStyle();
        var layerColor = layerStyle.getFill().getColor();
        var layerTitle = layer.get('title');
        legendHTMLString += getLegendElement(layerTitle, layerColor);
    }
}

// Avvia la generazione leggenda
(async () => {
    const layers = overlayLayers.getLayers().getArray();
    for (let layer of layers) {
        await processLayer(layer);
    }
    var legendContent = document.getElementById('legend-content');
    legendHTMLString += "</ul>";
    legendContent.innerHTML = legendHTMLString;
})();


// Finish building the legend HTML string
var legendContent = document.getElementById('legend-content');
legendHTMLString += "</ul>";
legendContent.innerHTML = legendHTMLString;

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
    } 
    if(overlayLayer.getSource() instanceof Group){
        for(let overlayLayer_child of overlayLayers.getLayers().getArray()){
            if(overlayLayer_child.getSource() instanceof ImageWMS){
                var legendURLParams = {format: "application/json"};
                var legendUrl = overlayLayer_child.getSource().getLegendUrl(0, legendURLParams);
                // make the legend JSON request
                await fetch(legendUrl).then(async (response) => {
                    await response.json().then((data) => {
                        var layerTitle = overlayLayer_child.get('title');
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
            }
        }
    }
    else {
        var layerStyle = overlayLayer.getStyle();
        var layerColor = layerStyle.getFill().getColor();
        var layerTitle = overlayLayer.get('title');
        legendHTMLString += getLegendElement(layerTitle, layerColor);
    }
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
*/