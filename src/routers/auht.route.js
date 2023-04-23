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
    //security issues. always register as user role.
    req.body.role = 'user';
    // save user object
    const userRecord = await userCollection.create(req.body, next);
    // get the user object and its token
    const output = {
      user: userRecord,
      token: userRecord.token,
    };

    // return the object and token to the client
    res.status(201).send(output);
  } catch (e) {
    console.error("ERROR - sign-up error: ", e);
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
    console.error("ERROR - sign-in server error: ", error);
    next('sign-in server error');
  }
}

// update user handler
async function updateUserHandler(req, res, next) {
  const {id} =req.params;
  const {firstName, lastName, email, phoneNumber, password, oldPassword} =req.body;
  try {
 
  let updatedObj = req.user;
  updatedObj.firstName = firstName;
  updatedObj.lastName = lastName;
  updatedObj.email = email;
  updatedObj.phoneNumber = phoneNumber;
// check if the user is editing his password or not. password >> represents the new pass, oldPassword >> the old pass.
  if (password && oldPassword) {

    // validate the old password first, then confirm new pass
    const valid = await bcrypt.compare(oldPassword, req.user.password);
    valid ? updatedObj.password = password : (console.error("ERROR - Invalid Old Password!"), next('Invalid Old Password!'));
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
    if (error.message == 'Validation error' && error?.errors[0]?.message == 'phoneNumber must be unique') {
      console.error("ERROR - Phone Number already exists!: ", error);
      next('Phone Number already exists!');
    }
    console.error("ERROR - update user error: ", error);
    next('update user error');
  }
}

module.exports = authRouter;
