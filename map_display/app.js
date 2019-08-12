/*jshint esversion: 6 */
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var request = require('request');

app.use(express.static('static'));

app.use(function (req, res, next){
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

// urls for location lookup, nearest-vertex, and routing
let lluhttp = "http://172.17.0.2:3001/api/address/";
let nvhttp = "http://172.17.0.3:8080/geoserver/wfs?service=WFS&version=1.2.0&request=GetFeature&typeName=routing:nearest_vertex&outputformat=application/json&viewparams=";
let rhttp = "http://172.17.0.3:8080/geoserver/wfs?service=WFS&version=1.2.0&request=GetFeature&typeName=routing:shortest_path&outputformat=application/json&viewparams=";

app.post('/api/address/', function (req, res, next) {
  request.post(lluhttp, { json: req.body }, (error, response, body) => {
    if (error) {
      res.status(500).json("Request Error.");
    } else {
      if (response.statusCode === 500) {
        res.status(500).json("Connection Error.");
      } else if (response.statusCode === 404) {
        res.status(404).json("Cannot find the address");
      } else res.json(body);
    }
  })
});

function srcLonLat(req, res) {
  var promise = new Promise(function(resolve, reject){
    request.post(lluhttp, { json: req.body.source }, (error, response, body) => {
      if (error) {
        reject('0');
      } else {
        if (response.statusCode === 500) {
          reject('1');
        } else if (response.statusCode === 404) {
          reject('2');
        } else resolve(body);
      }
    });
  })
  return promise;
}

function destLonLat(req, res, src_coord) {
  var promise = new Promise(function(resolve, reject){
    request.post(lluhttp, { json: req.body.destination }, (error, response, body) => {
      if (error) {
        reject('0');
      } else {
        if (response.statusCode === 500) {
          reject('1');
        } else if (response.statusCode === 404) {
          reject('2');
        } else resolve([src_coord, body]);
      }
    });
  })
  return promise;
}

function srcId(req, res, lst) {
  var promise = new Promise(function(resolve, reject){
    let src_coord = lst[0];
    let dest_coord = lst[1];
    let src_http = nvhttp + "x:" + src_coord.lon + ";y:" + src_coord.lat + ";";
    request(src_http, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        src_id = JSON.parse(body).features[0].properties.id;
        resolve([src_id, src_coord, dest_coord]);
      } else reject('3');
    });
  })
  return promise;
}

function destId(req, res, lst) {
  var promise = new Promise(function(resolve, reject){
    let src_coord = lst[1];
    let dest_coord = lst[2];
    let src_id = lst[0];
    let dest_http = nvhttp + "x:" + dest_coord.lon + ";y:" + dest_coord.lat + ";";
    request(dest_http, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        dest_id = JSON.parse(body).features[0].properties.id;
        resolve([src_id, dest_id, src_coord, dest_coord]);
      } else reject('3');
    });
  })
  return promise;
}

app.post('/api/routing/', function(req, res, next) {
  srcLonLat(req, res).then((src_coord) => {
    return destLonLat(req, res, src_coord);
  }).then((lst) => {
    return srcId(req, res, lst);
  }).then((lst) => {
    return destId(req, res, lst);
  }).then((lst) => {
    let src_id = lst[0];
    let dest_id = lst[1];
    let src_coord = lst[2];
    let dest_coord = lst[3];
    // get the routing between source and destination
    let route_http = rhttp + "source:" + src_id + ";target:" + dest_id + ";";
      request(route_http, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.json({routing: body, source: src_coord, destination: dest_coord});
        } else reject('3');
      });
  }).catch((err) => {
    if (err === '0') res.status(500).json("Request Error");
    else if (err === '1') res.status(500).json("Connection Error");
    else if (err === '2') res.status(404).json("Cannot find the address");
    else res.status(500).json("Unknown Error");
  })
});

app.use(function (req, res, next){
  console.log("HTTP Response", res.statusCode);
});

const http = require('http');
const PORT = 80;

http.createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});

const https = require('https');
const SSLPORT = 443;
const fs = require('fs');
const privateKey = fs.readFileSync('privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

https.createServer(credentials, app).listen(SSLPORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on https://localhost:%s", SSLPORT);
});
