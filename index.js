'use strict';
require('dotenv').config();

const PORT = process.env.PORT || 8005;
const { start } = require('./src/server');

// start the server
start(PORT);
