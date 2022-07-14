'use strict';

const express = require('express');

// use express Router
const authRouter = express.Router();

// import user model
const { userCollection } = require('../models/index');

// import basicAuth, bearerAuth middlewares
const basicAuth = require('../middlewares/basicAuth');
const bearerAuth = require('../middlewares/bearerAuth');

// auth routes
authRouter.post('/signup', signUpHandler);
authRouter.post('/signin', basicAuth, signInHandler);
authRouter.put('/user:id', bearerAuth, updateUserHandler);

// signup hndler
async function signUpHandler(req, res, next) {
  console.log('req.body', req.body);
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
  console.log('req.userrrrrrrrrrrrrrrrrrrrrr',req.user);
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

// update user handler
async function updateUserHandler(req, res, next) {
  const {id} =req.params;
  console.log('idddddddddd',id);
  console.log('req.body updattttte',req.body);
  try {
    // update user object
    const userRecord = await userCollection.update(id,req.body);
    console.log('updated user', userRecord);
    // get the user object and its token
    const output = {
      user: userRecord,
      token: userRecord.token,
    };

    // return the object and token to the client
    res.status(201).send(output);
  } catch (e) {
    next(e.message, 'update user error');
  }
}

module.exports = authRouter;
