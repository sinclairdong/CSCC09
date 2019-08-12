/* jshint esversion: 6 */
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'addressdb',
  password: '19970209',
  port: 5432,
})

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/api/address/', function (req, res, next) {
    let housenumber = req.body.housenumber;
    let street = req.body.street;
    let sql = "SELECT * FROM addresses WHERE LOWER(housenumber)=LOWER('" + housenumber + "') AND LOWER(street)=LOWER('" + street + "')";
    pool.query(sql, function(err, ret){
        if (err) res.status(500).json("connection fail");
        else {
	    if (ret.rows.length === 0) res.status(404).json("cannot find this address");
            else res.json(ret.rows[0]);
        }
    })
});


const http = require('http');
const PORT = 3001;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
