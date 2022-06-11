'use strict';

const express = require('express');

// use express Router
const apiRouter = express.Router();

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection } = require('../models/index');

// import basicAuth middleware
const bearerAuth = require('../middlewares/bearerAuth');

// access control list middleware
const permissions = require('../middlewares/acl');

// auth routes
apiRouter.post('/favourite', bearerAuth, permissions('write-limited'), addToFavouriteHandler);
apiRouter.get('/favourite', bearerAuth, permissions('read-limited'), getFavouriteHandler);
apiRouter.delete('/favourite', bearerAuth, permissions('delete-limited'), removeFavouriteHandler);
apiRouter.post('/addToCart', bearerAuth, addToCartHandler);
apiRouter.get('/allProducts', allProductsHandler);
apiRouter.get('/homePageProducts', homePageProductsHandler);

// add To Favourite Handler hndler
async function addToFavouriteHandler(req, res, next) {
  try {
    // save favourite & user ids
    const response = await userCollection.create(req.body);
    console.log('response', response);

    // return the object  to the client
    res.status(201).send(response);
  } catch (e) {
    next(e.message, 'add to favourite error');
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

module.exports = apiRouter;
