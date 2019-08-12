/*jshint esversion: 6*/
let api = (function(){
  "use strict";

  let module = {};

  function send(method, url, data, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
      else callback(null, JSON.parse(xhr.responseText));
    };
    xhr.open(method, url, true);
    if (!data) xhr.send();
    else{
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
  }

  module.locationLookUp = function(hnum, strt){
    send('POST', '/api/address/', {housenumber: hnum, street: strt}, function(err, res){
      if (err) return notifyErrorListeners(err);
      notifyLocationListener(res);
    });
  };

  module.searchRouting = function(src_hnum, src_strt, dest_hnum, dest_strt){
    let source = {housenumber: src_hnum, street: src_strt};
    let destination = {housenumber: dest_hnum, street: dest_strt};
    let src_dest = {source: source, destination: destination};
    send('POST', '/api/routing/', src_dest, function(err, res){
      if (err) return notifyErrorListeners(err);
      notifyRoutingListener(res);
    });
  };

  let locationListeners = [];

  function notifyLocationListener(location){
    locationListeners.forEach(function(listener){
      listener(location);
    });
  }

  module.onLocationUpdate = function(listener){
    locationListeners.push(listener);
  };

  let routingListeners = [];

  function notifyRoutingListener(routing){
    routingListeners.forEach(function(listener){
      listener(routing);
    });
  }

  module.onRoutingUpdate = function(listener){
    routingListeners.push(listener);
  };

  let errorListeners = [];

  function notifyErrorListeners(err){
    errorListeners.forEach(function(listener){
      listener(err);
    });
  }

  module.onError = function(listener){
    errorListeners.push(listener);
  };

  return module;
})();
