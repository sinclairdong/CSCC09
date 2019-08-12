# NoGoogleMap REST API Documentation

## Route API

**NOTE: Sample GeoJson response body can be find in test_url**

### Nearest Entry Point Look Up

- description: Search the information of nearest entry point  for an longtitude and latitude
- request: `get /geoserver/`
	- Geoserver wfs: wfs?service=WFS&version=1.2.0&request=GetFeature
	- sql view: &typeName=routing:nearest_vertex 
	- parameters: &viewparams=x:<X_CORD>;y:<Y_CORD>;
	- geoJson format: &outputformat=application/json 
	
- response: 200
    - content-type: `application/geoJson` (for more info visit http://geojson.org/)
	- body: A entrypoint in GeoJson format

``` 
$ curl http://127.0.0.1:8080/geoserver/wfs?service=WFS&version=1.2.0&request=GetFeature&typeName=routing:nearest_vertex&outputformat=application/json&viewparams=x:-79.257577;y:43.775851;
```

### Route Look Up

- description: get shortest rought from entrypoint A to entrypoint B
- request: `get /geoserver/ `

	- Geoserver wfs: wfs?service=WFS&version=1.2.0&request=GetFeature
	- sql view: &typeName=routing:shortest_path
	- parameters: &viewparams=source:<EntryPointId>;target:<EntryPointID>;
	- geoJson format: &outputformat=application/json 
- response: 200
    - content-type: `application/geoJson` (for more info visit http://geojson.org/)
	- body: A list of line strings that represand a path

``` 
$ curl http://127.0.0.1:8080/geoserver/wfs?service=WFS&version=1.2.0&request=GetFeature&typeName=routing:shortest_path&outputformat=application/json&viewparams=source:1858;target:25415;
```