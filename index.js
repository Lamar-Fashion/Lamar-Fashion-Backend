'use strict';
require('dotenv').config();


const PORT = process.env.PORT || 8005;
const { start } = require('./src/server');
const { db } = require('./src/models/index');

// start the server
db.sync().then(() => {
// db.sync({force: true}).then(() => {
    start(PORT);
}).catch(error =>{
    console.error('ERROR - Connection DB Error: ', error);
})