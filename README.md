# project-nogooglemap

Link: https://nogooglemap.canadacentral.cloudapp.azure.com/

Video: https://youtu.be/rTSFfeZskVI

**NOTE: for browser that doesn't support https. HTTP would also works**

**NOTE: It now only provides address lookup within Toronto and route finding within Scarborough to keep our database in a reasonable size.**

## sample location

- 5400 Lawrence Ave E
- 1298 military trl
- 941 Progress Ave
- 1450 Midland Ave 
- etc

# API documents

There are 3 services in our app.

You can find the API documentation in each service folder's doc folder. And there is a README.md have all api documentation.

For example if you want to access the API documentation for map display then you suppose to go to `map display` then `doc` then you will see the readme

## links

[map_display](map_display/doc/README.md)

[location_look_up](location_look_up/doc/README.md)

[routes_finding](routes_finding/doc/README.md)

# Team Member
	- Yuesen Dong 1002387632 dongyues
	- Chaoyue Xi 1002915688 xichaoyu
	- Yi Zhao 1001111389 zhaoyi34

# Project Discription

A google map like a web application that provides similar features. However, we will not use any Google API and all data comes from public data that everyone has access to read and write(successful update requires approval).

**NOTE: All calculation and data query are done locally with the exception of map tile images which can be easily converted.**

We have 3 services running that been encapsulate in three docker containers display, route, and address. They each communicate with HTTP request and restful APIs. We could in the future public those APIs allow third-party access(as for now it is private witch only visible to local request). And Display is responsible for all map, address, route display. Route is responsible for finding routes and address is responsible for address lookup. 

It now provides address lookup within Toronto and route finding within Scarbrough. 

It could be easily scaled up by introducing more data into PostgreSQL database however we didn't do so due to data size issues. 




	
# Key features for Beta version
Numbering means the priority, lower the number the higher the priority.
1. Map Display (show maps on the browser)
2. Location Lookup (search address or postcode to show location on the map)
3. Routes (find a reasonable route between two points that people can walk or car can travel though not a straight line).
    
# Additional features for Final version
4. All three servers encapsulate in Docker containers
5. All docker are deployed with Azure
6. It properly supports HTTPS and had a trusted authority signed SSL certificate

# Technology we will be using
- Map Display
    - Map tiles management: OpenLayers
    - OpenStreetMap: Map data provider
	- Bootstrap: for front end search bar
- Location Lookup (GeoCoder)
    - OpenAddress: Address data provider
    - postgresql: data storage
	- nodejs: request handler
- Routes
	- postgresql: data storage
	- geoJson: json schema to comunicate with map display
    - pgRounting: routing algorythem (dijkstra)
	- OverpassAPI: provide data
	- overpass turbo: convert OSM file into geoJson
	- gdal-bin: load geoJson data into postgresql
	- GeoServer: handle postgresql data query
	- TomCat: host GeoServer
	- geoJson.io: testing and visualize geoJson
- HTML hosting
    - NodeJs
- App hosting
	- Auzre: providing platform
	- Docker Container: encapsulate all three service
	- certbot: ganerate ssl certificate
	- letsencrypt: signed ssl certificate

# Technical challenges

1. Communicate between all libraries.
    - For example display map routes generated from pgRounting or real-time traffic on OpenLayers and etc
2. Understanding all libraries and make sure to accommodate each other 

3. Research and locate libraries we want to use for each feature
    - Sort of already finished but took me a lot of time

4. Research and locate public data we want to use for each feature

5. Debug, as we use a lot of open source libraries. Sometimes it is hard to know if that bug is on our end or it came with the library. 
	

# Deploy guide

Dependency: Docker CE

Port needed: 80, 443, 3001, 8080

## Docker containers

The containers can be found here

https://hub.docker.com/r/sinclairdong/cscc09

## Set up docker containers

### Pull the container from DockerHub

```
docker pull sinclairdong/cscc09:display
docker pull sinclairdong/cscc09:route
docker pull sinclairdong/cscc09:address
```

### Run the docker images 

**NOTE: port 80 443 3001 and 8080 will be needed**

```
docker run -p=8080:8080 -dit --name route sinclairdong/cscc09:route /bin/bash
docker run -p=3001:3001 -dit --name address sinclairdong/cscc09:address /bin/bash
docker run -p=80:80 -p=443:443 -dit --name display sinclairdong/cscc09:display /bin/bash
```

## Start all service

How to access a docker container

```
docker exec -it <container_name_or_id> /bin/bash
```

start route service please go to route container then

```
service postgresql start
cd /usr/share/geo*/bin
bash start.sh
```

start address service please

```
service postgresql start
cd llu
node app.js
```

start map display

```
cd project-nogooglemap/nogooglemap
node app.js
```

now you suppose to find the https service on port 443 and http on 80
