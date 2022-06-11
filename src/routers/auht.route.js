'use strict';

const express = require('express');

// use express Router
const authRouter = express.Router();

// import user model
const { userCollection } = require('../models/index');

// import basicAuth middleware
const basicAuth = require('../middlewares/basicAuth');

// auth routes
authRouter.post('/signup', signUpHandler);
authRouter.post('/signin', basicAuth, signInHandler);

// signup hndler
async function signUpHandler(req, res, next) {
  console.log('userCollection', userCollection);
  try {
    // save user object
    const userRecord = await userCollection.create(req.body);
    console.log('userRecord', userRecord);
    // get the user object and its token
    const output = {
      user: userRecord,
      token: userRecord.token,
    };

    // return the object and token to the client
    res.status(201).send(output);
  } catch (e) {
    next(e.message, 'sign-up error');
  }
}

// sign-in handler
function signInHandler(req, res, next) {
  const user = {
    user: req.user,
    token: req.user.token,
  };
  try {
    res.status(200).send(user);
  } catch (error) {
    next(e.message, 'sign-in error');
  }
}

module.exports = authRouter;
