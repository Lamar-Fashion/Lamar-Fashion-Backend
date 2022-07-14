'use strict';

module.exports = (err, req, res, next) => {
  let error = { error: err.message || err, route: req.path };
  console.log('errror from controller',err);
  console.log('errror from 500',error);
  res.statusCode = err.status || 500;
  res.statusMessage = err.statusMessage || 'Server Error';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
