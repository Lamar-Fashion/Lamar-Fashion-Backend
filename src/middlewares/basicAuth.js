'use strict';

// import base64 library
const base64 = require('base-64');

// import user model
const { userCollection } = require('../models/index');

// export basic auth middleware
module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return errorByAuthentication();
  }

  let basic = req.headers.authorization.split(' ').pop();

  // get original phoneNumber & passowrd
  let [user, pass] = base64.decode(basic).split(':');

  try {
    // check the phoneNumber & password with original ones in DB
    req.user = await userCollection.model.authenticateBasic(user, pass);
    next();
  } catch (e) {
    errorByAuthentication(e);
  }

  // error handler for invalid phoneNumber or password
  function errorByAuthentication(e) {
    console.error("ERROR - Invalid Phone Number or password: ", e);
    next('Invalid Phone Number or password');
  }
};
