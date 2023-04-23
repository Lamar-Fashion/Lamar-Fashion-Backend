'use strict';

// import user model
const { userCollection } = require('../models/index');

// export bearer auth middleware
module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      errorByAuthentication();
    }

    const token = req.headers.authorization.split(' ').pop();
    // check the token with the original one by the username & the SECRET
    const validUser = await userCollection.model.authenticateToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    errorByAuthentication(e);
  }
  
  // error handler for invalid token
  function errorByAuthentication(e) {
    console.error("ERROR - Invalid Token: ", e);
    next('Invalid Token');
  }
};
