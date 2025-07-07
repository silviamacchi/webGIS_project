//import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { Map, View, Overlay } from 'ol';
import { Tile, Image, Group, Vector } from 'ol/layer';
import LayerGroup from 'ol/layer/Group';
import LayerVector from 'ol/layer/Vector';
import LayerTile from 'ol/layer/Tile'; // added for layer selection/visualization
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

// no2 annual average difference
let NO2_aad = new Image({
    title: "Annual average difference no2",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_NO2_2017-2021_AAD_map_2022	' }
    }),
    visible: false
});

// pm2p5 annual average difference
let pm2p5_aad = new Image({
    title: "Annual average difference pm2p5",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_pm2p5 _2017-2021_AAD_map _2022' }
    }),
    visible: false
});

// pm10 annual average difference
let pm10_aad = new Image({
    title: "Annual average difference pm10",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:FRANCE_pm10 _2017-2021_AAD_map _2022' }
    }),
    visible: false
});

// no2 concentration map 2020
let NO2_2020 = new Image({
    title: "Concentration no2 2020",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:rec_France_average_NO2_2020	' }
    }),
    visible: false
});

// pm2p5 concentration map 2020
let pm2p5_2020 = new Image({
    title: "Concentration pm2p5  2020",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:France_pm2p5_concentration_map_2020' }
    }),
    visible: false
});

// pm10 concentration map 2020
let pm10_2020 = new Image({
    title: "Concentration pm10 2020",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gisgeoserver_03:rec_France_average_pm10_2020' }
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
            title: 'Annual Average Difference 2022 from 5-year Mean',
            fold: 'close',
            visible: false,
            layers: [NO2_aad, pm2p5_aad, pm10_aad]
        }),
        new Group({
            title: 'Annual average concentration 2020',
            fold: 'close',
            visible: false,
            layers: [NO2_2020, pm2p5_2020, pm10_2020]
        }),
        Land_cover,
    ]
});

// 3. Funzione per rendere visibile un solo layer alla volta
function enforceSingleVisibleLayer(changedLayer) {
  overlayLayers.getLayers().forEach(group => {
    if (group instanceof LayerGroup) {
      group.getLayers().forEach(layer => {
        if (layer !== changedLayer &&
        !layer.get('excludeFromToggle')) //  skip excluded layers (France boundaries) 
        {
          layer.setVisible(false);
        }
      });
    } else {
      if (group !== changedLayer && !group.get('excludeFromToggle'))
     {
        group.setVisible(false);
      }
    }
  });
}

// 4. Aggiungi listener a ogni layer per gestire la visibilità esclusiva
overlayLayers.getLayers().forEach(group => {
  if (group instanceof LayerGroup) {
    group.getLayers().forEach(layer => {
      layer.on('change:visible', function () {
        if (layer.getVisible()) {
          enforceSingleVisibleLayer(layer);
        }
      });
    });
  } else {
    group.on('change:visible', function () {
      if (group.getVisible()) {
        enforceSingleVisibleLayer(group);
      }
    });
  }
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
var cartoDBDarkMatter = new Tile({
  title: 'CartoDB Dark Matter',
  type: 'base',
  visible: false,
  source: new XYZ({
        attributions: 
            '© <a href="https://carto.com/">Carto</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        url: 
            'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
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
basemapLayers.getLayers().extend([stamenWatercolor, cartoDBDarkMatter, stamenToner]);

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
    visible: true,
    excludeFromToggle: true, // exclude this layer from the layer switcher
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
    element: container, content: content,
}); 

map.addOverlay(popup);

closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur(); 
    return false;
};

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

//This updates the legend, since we have just ImageWMS and geoJson as layers it takes care of just these two cases
async function updateLegend() {
    let localLegendHTML = '<ul>';
    async function processLayer(layer) {
        if (layer instanceof Group) { //if the current layes is a group we call the function recursively on its sublayers
            const subLayers = layer.getLayers().getArray();
            for (let subLayer of subLayers) {
                await processLayer(subLayer);
            }
        } else if (!layer.getVisible()) {//If the layer is not visible we don't add it to the legend
            return;
        } else if (layer.getSource && layer.getSource() instanceof ImageWMS) {
            const layerTitle = layer.get('title');
            localLegendHTML += getLegendElement(layerTitle, null);
            const legendUrl = layer.getSource().getLegendUrl(undefined, {
                                                                        'FORMAT': 'image/png',
                                                                        'TRANSPARENT': true
                                                                        }); 
            //We get the image legend and show it as a picture
            if (legendUrl) {
                const legendHtml = '<img src="' + legendUrl + '" alt="Legend">';
                localLegendHTML += legendHtml;
            }

        } else {//This is teh case of GeoJSON
            var layerStyle = layer.getStyle();
            var layerColor = layerStyle.getStroke().getColor();
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


