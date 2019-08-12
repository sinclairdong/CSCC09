// from https://medium.com/attentive-ai/working-with-openlayers-4-part-1-creating-the-first-application-9ab27bbd7a62

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-79.3832,43.6532]), // Coordinates of Toronto
    zoom: 10 //Initial Zoom Level
  })
});

var pinStyle = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 1],
    src: "../media/placeholder.png",
    scale: 0.07
  })
});

var lineStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 5,
    color: [16, 128, 226]
  })
})

var marker1 = new ol.Feature({
  geometry: new ol.geom.Point(
    ol.proj.fromLonLat([-79.3832,43.6532])
  ),
});
marker1.setStyle(pinStyle);
var marker2 = new ol.Feature({
  geometry: new ol.geom.Point(
    ol.proj.fromLonLat([-79.3832,43.6532])
  ),
});
marker2.setStyle(pinStyle);

var vectorSource = new ol.source.Vector({
  features: [marker1, marker2]
});

var markerVectorLayer = new ol.layer.Vector({
  source: vectorSource,
});
map.addLayer(markerVectorLayer);
