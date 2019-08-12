# NoGoogleMap REST API Documentation

## Address API

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
    - body: connection fail
- response: 404
    - body: cannot find this address

``` 
$ curl http://localhost:3001/api/address 
       -d '{"housenumber": "22", "street": "lloyd george ave"}' 
       -X POST 
       -H "Content-Type:application/json"
```
