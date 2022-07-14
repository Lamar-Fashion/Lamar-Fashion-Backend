'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// use express Router
const apiRouter = express.Router();

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection } = require('../models/index');

// import basicAuth middleware
const bearerAuth = require('../middlewares/bearerAuth');

// access control list middleware
const permissions = require('../middlewares/acl');

// api routes
apiRouter.post('/favourite', bearerAuth, addToFavouriteHandler);
// apiRouter.get('/favourite', bearerAuth,  getFavouriteHandler);
// apiRouter.delete('/favourite', bearerAuth, removeFavouriteHandler);
apiRouter.post('/addToCart', addToCartHandler);
apiRouter.get('/allProducts', allProductsHandler);
apiRouter.get('/homePageProducts', homePageProductsHandler);

// add To Favourite Handler
async function addToFavouriteHandler(req, res, next) {
  try {
    // save favourite & user ids
    const response = await favouritCollection.create(req.body);
    console.log('response', response);

    // return the object  to the client
    res.status(201).send(response);
  } catch (e) {
    next(e.message, 'add to favourite error');
  }
}

// add To cart Handler
async function addToCartHandler(req, res, next) {
  try {

  const { productInfo, personalInfo,totalPrice  } = req.body;
  console.log('req.body',req.body);
  let currentdate = new Date(); 
let datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + "@"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

  const orderId = uuidv4().slice(0,6).toUpperCase()+ "-" + datetime ;
  let order = {
    productInfo,
    personalInfo,
    totalPrice,
    orderId
  }
  let total = 0;
// validate total price
for (let i = 0; i < productInfo.length; i++) {
  total= total +  productInfo[i].quantity * Number(productInfo[i].price);
}
if (total !== totalPrice) return next('invalid total price!');

    // save the order
    const response = await bookedAbayaCollection.create(order);
    console.log('response', response);

    // return the object  to the client
    res.status(201).send(response);
  } catch (e) {
    next(e.message, 'save order error');
  }
}

// get all Products handler
async function allProductsHandler(req, res, next) {
  try {
    const products = await abayaCollection.read();

    res.status(200).send(products);
  } catch (error) {
    next(e.message, 'get all products error');
  }
}
// get home page Products handler
async function homePageProductsHandler(req, res, next) {
  try {
    const products = await abayaCollection.model.findAll({
      where: {
        addToHomePage : true
      }
    });

    res.status(200).send(products);
  } catch (error) {
    next(e.message, 'get home products error');
  }
}

module.exports = apiRouter;
