# PATHFINDING


## user maual

start the geo server 

```
cd /usr/share/geo*/bin
sudo bash start.sh
```

then make request according to test

## Required Dependency and install cheat sheet

### PSQL

```
sudo apt install postgresql postgresql-contrib
```

### pgrouting

```
sudo apt install postgresql-10-pgrouting
```

### ORG to load data

```
sudo apt install gdal-bin
```


## cheat sheet

### load data into database from geojson

```
ogr2ogr -select 'name,highway,oneway,surface' -lco GEOMETRY_NAME=the_geom -lco FID=id -f PostgreSQL PG:"dbname=routedb host=127.0.0.1 port=5432 user=postgres password=19970209" -nln edges export.geojson
```

### add source and target column

after login

```
ALTER TABLE edges ADD source INT4; ALTER TABLE edges ADD target INT4;
```


### export map data

overpass turbo

```
(
  way
    (around:3000,43.78816663,-79.19116974)
    ["highway"~"^(primary|secondary|tertiary|residential)$"]
    ["name"];
  
);
out geom;
```


### geoserver

```
http://localhost:8080/geoserver
```

username = admin

password = geoserver


# NOTES from https://github.com/thegisdev/leaflet-pgrouting-geoserver
### Step 4: Split nodes to be used in creating topology

`SELECT pgr_nodeNetwork('edges', 0.00001);`

**NOTE**
We are using a tolerance of 0.00001 because our data is in EPSG:4326 (meter as projection unit - points have to be less than 0.00001 meters away from each other)
**Reference**:
https://gis.stackexchange.com/questions/229452/pgr-createtopology-how-tolerance

For details on `pgr_nodeNetwork` function please refer from [here](https://docs.pgrouting.org/2.5/en/pgr_nodeNetwork.html#pgr-node-network)


### Step 5 : Create topology
`SELECT pgr_createTopology('edges_noded', 0.00001);`

Details on `pgr_createTopology` function [here](https://docs.pgrouting.org/2.5/en/pgr_createTopology.html#pgr-create-topology)


### Step 6 : Copy  attribute information from the original table to the new noded table

 **Add Columns first:**
```
ALTER TABLE edges_noded
 ADD COLUMN name VARCHAR,
 ADD COLUMN type VARCHAR;
 ```

**Copy the data from the original table:**

```
UPDATE edges_noded AS new
 SET name=old.name, 
   type=old.highway 
FROM edges as old
WHERE new.old_id=old.id;
```

### Step 7: Determine Cost

We will simply use distance as the costing factor. Note you can also use other parameters like type of road, traffic etc..

**Precalculate distance to save geoserver from calculating on each request:**

**Add Distance Column**

`ALTER TABLE edges_noded ADD distance FLOAT8;`

**Calculate distances in meters:**

`UPDATE edges_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000;`

### Step 8 : Test shortest path with Dijkistra algorithm

`SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance as cost FROM edges_noded',1,2,false);`

For details on `pgr_dijkstra` please [check here](https://docs.pgrouting.org/2.5/en/pgr_dijkstra.html#pgr-dijkstra)


### Step 9: Publishing to geoserver
Create  2 parameterized SQL Views to have the following code:

1. **Nearest Vertex SQL View**
```
SELECT
  v.id,
  v.the_geom,
  string_agg(distinct(e.name),',') AS name
FROM
  edges_noded_vertices_pgr AS v,
  edges_noded AS e
WHERE
  v.id = (SELECT
            id
          FROM edges_noded_vertices_pgr
          ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(%x%, %y%), 4326) LIMIT 1)
  AND (e.source = v.id OR e.target = v.id)
GROUP BY v.id, v.the_geom
```

**Validation for parametes**
To ensure that the sql view gets the correct parameters, add the below validation that checks the values as float type in the geoserver sql view under the parameters:

`^[\d\.\+-eE]+$`

2. **Shortest Path SQL View**
```
SELECT
 min(r.seq) AS seq,
 e.old_id AS id,
 e.name,
 e.type,
 sum(e.distance) AS distance,
ST_Collect(e.the_geom) AS geom 
 FROM pgr_dijkstra('SELECT id,source,target,distance AS cost 
 FROM edges_noded',%source%,%target%,false) AS r,edges_noded AS e 
 WHERE r.edge=e.id GROUP BY e.old_id,e.name,e.type
```
 **Validation**
 Ensure parameters are integers

`^[\d]+$`

 ### Step 10 : Leaflet JS Client
 
 Please take a look at the code and it should be easy to follow along with the comments in the code

