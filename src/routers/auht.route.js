'use strict';

const express = require('express');
const bcrypt = require('bcrypt');

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
  try {
    // save user object
    const userRecord = await userCollection.create(req.body,next);
    console.log('userRecord', userRecord);
    // get the user object and its token
    const output = {
      user: userRecord,
      token: userRecord.token,
    };

    // return the object and token to the client
    res.status(201).send(output);
  } catch (e) {
    
    next('sign-up error');
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
    next('sign-in server error');
  }
}

// update user handler
async function updateUserHandler(req, res, next) {
  const {id} =req.params;
  const {firstName,lastName,email,password,oldPassword} =req.body;
  try {
 
  let updatedObj = req.user;
  updatedObj.firstName = firstName;
  updatedObj.lastName = lastName;
  updatedObj.email = email;
// check if the user is editing his password or not. password >> represents the new pass, oldPassword >> the old pass.
  if (password && oldPassword) {

    // validate the old password first, then confirm new pass
    const valid = await bcrypt.compare(oldPassword, req.user.password);
    valid ? updatedObj.password = password : next('Invalid Old Password!');
  }else{
    updatedObj.passDidnotChanged = true;
  }
 

    // update user object
    const userRecord = await updatedObj.save();

    // get the user object and its token
    const output = {
      user: userRecord,
      token: userRecord.token,
    };

    // return the object and token to the client
    res.status(201).send(output);
  } catch (error) {
    if (error.message == 'Validation error' && error?.errors[0]?.message == 'email must be unique') {
      next('email already exists!');
           
         }
    next('update user error');
  }
}

module.exports = authRouter;
