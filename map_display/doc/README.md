# NoGoogleMap REST API Documentation

## Display API

### Address Look Up

- description: Search the information for an address
- request: `POST /api/address/`
    - content-type: `application/json`
    - body: object
      - housenumber: (string) the housenumber of the address
      - street: (string) the street name of the address
- response: 200
    - content-type: `application/json`
    - body: object
      - lon: (string) the lontitude of the address
      - lat: (string) the latitude of the address
      - hosuenumber: (string) the housenumber of the address
      - street: (string) the street name of the address
      - city: (string) the city of the address
- response: 500
    - body: Request Error
- response: 500
    - body: Connection Error
- response: 404
    - body: Cannot find the address

``` 
$ curl http://localhost:80/api/address 
       -d '{"housenumber": "22", "street": "lloyd george ave"}' 
       -X POST 
       -H "Content-Type:application/json"
```

### Routes Look Up

- description: Search the routes between two addresses
- request: `POST /api/routing/`
    - content-type: `application/json`
    - body: object
      - source: (object) the address of the source
        - housenumber: (string) the housenumber of the address
        - street: (string) the street name of the address
      - destination: (object) the address of the destination
        - housenumber: (string) the housenumber of the address
        - street: (string) the street name of the address
- response: 200
    - content-type: `application/json`
    - body: object
      - routing: (object) the information of the routes
      - source: (object) the information of the source
      - destination: (object) the information of the destination
- response: 500
    - body: Request Error
- response: 500
    - body: Connection Error
- response: 404
    - body: Cannot find the address
- response: 500
    - body: Unknown Error

``` 
$ curl https://localhost:80/api/routing
       -d '{source: {"housenumber": "22", "street": "lloyd george ave"}, destination: {"housenumber": "68", "street": "grangeway ave"}}'
       -X POST
       -H "Content-Type:application/json"
```
