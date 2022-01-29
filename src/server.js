'use strict';

// import packages
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

//import error handlers
const notFound = require('./error-handlers/404');
const errorHandler = require('./error-handlers/500');

// proof of life
app.get('/', (req, res) => {
  res.send({ msg: 'Home server route', status: res.statusCode });
});

// error routes
app.use(notFound);
app.use(errorHandler);

const start = (port) => {
  app.listen(port, () => {
    console.log(`UP & RUNNING @ ${port}`);
  });
};
// export SERVER
module.exports = {
  start,
};
