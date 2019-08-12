/*jshint esversion: 6*/
(function(){
  "use strict";

  // switch between location search and routing search: toggle display and required
  document.querySelector("#switch-routing").addEventListener('click', function(e){
    e.preventDefault();
    document.querySelector("#search-routing-form").style.display = 'block';
    document.querySelector("#post-source").required = true;
    document.querySelector("#post-destination").required = true;
    document.querySelector("#post-single-address").required = false;
    document.querySelector("#search-single-form").style.display = 'none';
  });

  document.querySelector("#switch-location").addEventListener('click', function(e){
    e.preventDefault();
    document.querySelector("#post-source").required = false;
    document.querySelector("#post-destination").required = false;
    document.querySelector("#search-routing-form").style.display = 'none';
    document.querySelector("#search-single-form").style.display = 'block';
    document.querySelector("#post-single-address").required = true;
  });

  api.onLocationUpdate(function(location){
    document.querySelector("#error-box").innerHTML = ``;

    // if there is an existing routing layer, remove it
    let layerArray = map.getLayers().getArray().slice();
    layerArray.forEach(function(layer){
      if (layer.get('name') === "routeVectorLayer") map.removeLayer(layer);
    });

    // change map center to the location
    map.getView().setCenter(ol.proj.fromLonLat([Number(location.lon), Number(location.lat)]));
    // zoom in
    map.getView().setZoom(18);

    // move markers to the location
    marker1.getGeometry().setCoordinates(ol.proj.fromLonLat([Number(location.lon), Number(location.lat)]));
    marker2.getGeometry().setCoordinates(ol.proj.fromLonLat([Number(location.lon), Number(location.lat)]));
  });

  api.onRoutingUpdate(function(routingInfo){
    document.querySelector("#error-box").innerHTML = ``;

    // if there is an existing routing layer, remove it
    let layerArray = map.getLayers().getArray().slice();
    layerArray.forEach(function(layer){
      if (layer.get('name') === "routeVectorLayer") map.removeLayer(layer);
    });

    let routes = (new ol.format.GeoJSON()).readFeatures(routingInfo.routing, {featureProjection: 'EPSG:3857'});
    var routeVectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: routes
      }),
      style: lineStyle
    });
    routeVectorLayer.set('name', 'routeVectorLayer');
    map.addLayer(routeVectorLayer);

    // change extent
    var extent = ol.extent.createEmpty();
    ol.extent.extend(extent, routeVectorLayer.getSource().getExtent());
    map.getView().fit(extent, map.getSize());


    // move markers to the location
    marker1.getGeometry().setCoordinates(ol.proj.fromLonLat([Number(routingInfo.source.lon), Number(routingInfo.source.lat)]));
    marker2.getGeometry().setCoordinates(ol.proj.fromLonLat([Number(routingInfo.destination.lon), Number(routingInfo.destination.lat)]));
  });

  function parseAddress(address){
    address = address.trim();
    let housenumber = address.slice(0, address.search(" "));
    let street = address.slice(address.search(" ")+1);
    return {housenumber: housenumber, street: street};
  }

  api.onError(function(error){
    document.querySelector("#error-box").innerHTML = error;
  });

  window.addEventListener('load', function(){
    document.querySelector('#search-single-form').addEventListener('submit', function(e){
      e.preventDefault();
      let address = document.querySelector("#post-single-address").value;
      let parsedAddr = parseAddress(address);
      document.querySelector("#search-single-form").reset();
      api.locationLookUp(parsedAddr.housenumber, parsedAddr.street);
    });
  });

  window.addEventListener('load', function(){
    document.querySelector('#search-routing-form').addEventListener('submit', function(e){
      e.preventDefault();
      let source = document.querySelector("#post-source").value;
      let destination = document.querySelector("#post-destination").value;
      let parsedSrc = parseAddress(source);
      let parsedDest = parseAddress(destination);
      document.querySelector("#search-routing-form").reset();
      api.searchRouting(parsedSrc.housenumber, parsedSrc.street, parsedDest.housenumber, parsedDest.street);
    });
  });
}());
