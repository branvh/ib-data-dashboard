const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const app = new express();
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const request = require('request');
const env = process.env;
const socketio = require('socket.io');
const frbDataGet = require('./frbDataRequest.js');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//view engine and middleware such as body parser (via app.use)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.enable('trust proxy');
app.use(express.static(__dirname + '/public')); //to set path for static resources such as css, client-side .js
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/ejs');


//handle get request to landing page
app.get('/', (req, res) => {

    res.render('index.ejs'); //would send a json object to the browser if we did res.json(object)
});

//listen on port 8000
const server = app.listen(env.NODE_PORT || 8000, env.NODE_IP || 'localhost', () => {
    console.log('At the URL: http://localhost:8000');
})

//==========Setup a socket to leverage for data transmission to the client==============
const io = socketio(server);
let connections = [];
let chatters = [];

io.on('connection', (socket) => {

    console.log('socket connected: ' + socket.id);

    io.emit('new instance', {
        sockId: socket.id

    });

    //=========Multiple socket emissions to send FRB data to the client=============
    frbDataGet.cre.then((responseArr) => {
        responseArr.forEach((item) => {
        	        io.emit('commercial real estate data', item);
        });
    }).catch((err) => {
        console.log('Error: ' + err);
    });    

    frbDataGet.ci.then((responseArr) => {
        responseArr.forEach((item) => {
        	        io.emit('commercial and industrial loan data', item);
        });
    }).catch((err) => {
        console.log('Error: ' + err);
    });

    frbDataGet.mortgage.then((responseArr) => {
        responseArr.forEach((item) => {
        	        io.emit('mortgage data', item);
        });
    }).catch((err) => {
        console.log('Error: ' + err);
    });

    frbDataGet.card.then((responseArr) => {
        responseArr.forEach((item) => {
        	        io.emit('card data', item);
        });
    }).catch((err) => {
        console.log('Error: ' + err);
    });    

    frbDataGet.rates.then((responseArr) => {
        responseArr.forEach((item) => {
        	        io.emit('rate data', item);
        });
    }).catch((err) => {
        console.log('Error: ' + err);
    });

    //===========End of data emission logic==============

    io.on('disconnect', () => {
        console.log('disconnected');
    });

});

