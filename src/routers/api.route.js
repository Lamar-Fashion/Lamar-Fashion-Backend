'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {db} = require('../models/index');
const { checkProductDiscounts } = require('../helpers');

// use express Router
const apiRouter = express.Router();

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection, userCollection, adminSettingsCollection } = require('../models/index');

// import basicAuth middleware
const bearerAuth = require('../middlewares/bearerAuth');

// access control list middleware
const permissions = require('../middlewares/acl');

// api routes
apiRouter.post('/favourite', bearerAuth, addToFavouriteHandler);
apiRouter.get('/favourite/:userId', bearerAuth,  getFavouriteHandler);
apiRouter.delete('/favourite/:userId/:id', bearerAuth, removeFavouriteHandler);
apiRouter.post('/addToCart', addToCartHandler);
apiRouter.get('/allProducts', allProductsHandler);
apiRouter.get('/homePageProducts', homePageProductsHandler);
apiRouter.get('/search/:lookupValue', searcchProductsHandler);
apiRouter.get('/adminSettings', getAdminSettingsHandler);

// add To Favourite Handler
async function addToFavouriteHandler(req, res, next) {
  const {userId , abayaId} = req.body;


  try {
    let favFromDB = await favouritCollection.model.findOne({where:{userId:userId.toString() }});
    let favObj ,response;
if (favFromDB) {

  if(favFromDB.abayaId.includes(abayaId.toString())) return res.status(200).send({msg:'already in your wishlist'});
  // prevent duplicates items
  !favFromDB.abayaId.includes(abayaId.toString()) ? favFromDB.abayaId = [...favFromDB.abayaId,abayaId.toString()] : null;

  //update the obj
  response = await favFromDB.save();
}else{
  favObj = {
    userId,
    abayaId: [abayaId.toString()]
  }

  // save first favourite record for this user
  response = await favouritCollection.create(favObj,next);
}
     
    // return the object  to the client
    res.status(200).send(response);
  } catch (e) {
    next('add to favourite error');
  }
};
// get favourites handler
async function getFavouriteHandler(req, res, next) {
  const {userId} = req.params;
  try {
    const userFavRecord = await favouritCollection.read(userId);
    let allFavItems;

if (userFavRecord && userFavRecord.length > 0 && userFavRecord[0].abayaId && userFavRecord[0].abayaId.length > 0) {

  const favPromises = userFavRecord[0]?.abayaId?.map(async(favId)=>{
    const favItem = await abayaCollection.model.findOne({
      where:{id : favId } });
      return favItem;
  })
       allFavItems  = await Promise.all(favPromises);
let freeDeletedIds = [];
       // remove null values that comes from getting deleting products
     const freeNullArray =   allFavItems.filter((item)=> {
      
      if(item) {
        freeDeletedIds.push(item.id.toString());
        return item;
      }
    
    })
    userFavRecord[0].abayaId = freeDeletedIds;
    await userFavRecord[0].save();
    res.status(200).send(freeNullArray);

  
}else{

  allFavItems = [];
  res.status(200).send(allFavItems);

}

  } catch (error) {
    next('get favourites error');
  }
};
// remove favourites handler
async function removeFavouriteHandler(req, res, next) {
  const {userId,id} = req.params;
  try {
    let userFavRecord = await favouritCollection.model.findOne({where:{userId:userId.toString() }});

    userFavRecord?.abayaId?.map((favId,idx)=>{
if (favId == id) {
  userFavRecord.abayaId.splice(idx,1);
  return;
}
});
const newAbayaIds = userFavRecord.abayaId;
userFavRecord.abayaId=null;
userFavRecord.abayaId= newAbayaIds;
 await userFavRecord.save({ fields: ['abayaId'] });
 let response = await userFavRecord.reload();
    res.status(200).send(response);
  } catch (error) {
    next('remove favourite error');
  }
};

// add To cart Handler
async function addToCartHandler(req, res, next) {
  try {
    const { productInfo, personalInfo,totalPrice  } = req.body;

    //check if the user logged-in or not. so he can benefit sign-in discount.
    let isLoggedIn = false;
    let signInDiscount = 0;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ').pop();
      // check the token with the original one by the username & the SECRET
      const validUser = await userCollection.model.authenticateToken(token);
  
      if (validUser) {
        isLoggedIn = true;
      }

      // get admin settings to check `signinDiscount` percentage.
      const response = await adminSettingsCollection.read();
      signInDiscount = response[0].dataValues.signInDiscount;
    }

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
    };
    let total = 0;
    //add delivery fees 50 QAR.
    total = 50;
    // validate total price
    for (let i = 0; i < productInfo.length; i++) {
      const price = productInfo[i].price;
      const discount = productInfo[i].discount;
      total = total +  productInfo[i].quantity * checkProductDiscounts(price, isLoggedIn, signInDiscount, discount);
    }
    if (total !== totalPrice) return next('invalid total price!');

        // save the order
        const response = await bookedAbayaCollection.create(order,next);

        // return the object  to the client
        res.status(201).send(response);
  } catch (e) {
    next('submit order - server error');
  };
};

// get all Products handler
async function allProductsHandler(req, res, next) {
  try {
    const products = await abayaCollection.read();

    res.status(200).send(products);
  } catch (error) {
    next('get all products error');
  }
};
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
    next('get home products error');
  }
};
// search Products handler
async function searcchProductsHandler(req, res, next) {
  let {lookupValue} = req.params;
  lookupValue = lookupValue.toLowerCase();
  const sequelize = db;
  try {
    const matchedProducts = await abayaCollection.model.findAll({
      // limit: 10,
          where: {
              code: sequelize.where(sequelize.fn('LOWER', sequelize.col('code')), 'LIKE', '%' + lookupValue + '%')
          }
    });
    res.status(200).send(matchedProducts);
  } catch (error) {
    next('search products error');
  }
};

//get admin settings handler
async function getAdminSettingsHandler(req, res, next) {
  try {
    // get settings
    const response = await adminSettingsCollection.read();

    res.status(200).send(response);
  } catch (e) {
    next('get admin settings error');
  }
};

module.exports = apiRouter;
