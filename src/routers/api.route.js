'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {db} = require('../models/index');
const { checkProductDiscounts, checkExpirationDate, generateOrderSummaryMessage, generateOrderSummaryHTMLMessage } = require('../helpers');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// use express Router
const apiRouter = express.Router();

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection, userCollection, adminSettingsCollection } = require('../models/index');

// import basicAuth middleware
const bearerAuth = require('../middlewares/bearerAuth');

// access control list middleware
const permissions = require('../middlewares/acl');
const { nodemailerCaller } = require('../lib/nodemailer');

//save OTPs to verify. phoneNumber:OTP pairs
const OTPs = new Map();

// api routes
apiRouter.post('/favourite', bearerAuth, addToFavouriteHandler);
apiRouter.get('/favourite/:userId', bearerAuth,  getFavouriteHandler);
apiRouter.delete('/favourite/:userId/:id', bearerAuth, removeFavouriteHandler);
apiRouter.post('/addToCart', checkPromoExists, validatePromoCode, addToCartHandler);
apiRouter.get('/allProducts', allProductsHandler);
apiRouter.get('/product/:productId', getProductHandler);
apiRouter.get('/homePageProducts', homePageProductsHandler);
apiRouter.get('/search/:lookupValue', searcchProductsHandler);
apiRouter.get('/adminSettings', getAdminSettingsHandler);
apiRouter.post('/promoCode', validatePromoCode, applyPromoCodeHandler);
apiRouter.post('/sendOTP', sendOTPHandler);
apiRouter.post('/verifyOTP', verifyOTPHandler);

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
    console.error("ERROR - add to favourite error: ", e);
    next('add to favourite error');
  }
};
// get favourites handler
async function getFavouriteHandler(req, res, next) {
  const {userId} = req.params;
  try {
    const userFavRecord = await favouritCollection.read("userId", userId);
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

  } catch (e) {
    console.error("ERROR - get favourites error: ", e);
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
  } catch (e) {
    console.error("ERROR - remove favourite error: ", e);
    next('remove favourite error');
  }
};

// add To cart Handler
async function addToCartHandler(req, res, next) {
  try {
    const { productInfo, personalInfo, totalPrice, promoCodeValidationResponse, totalPromoApplied, phoneNumber } = req.body;

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
    if (total !== totalPrice) {
      console.error("ERROR - invalid total price!");
      return next('invalid total price!');
    }

    //update order obj to save sign in discount and product discount if used or existed.
    const otherInfo = {
      signInDiscount: {isSignInDiscountUsed: false, discountPercentage: null}
    };

    if (isLoggedIn && signInDiscount) {
      otherInfo.signInDiscount.isSignInDiscountUsed = true;
      otherInfo.signInDiscount.discountPercentage = signInDiscount;
    }

    order.otherInfo = otherInfo;

    //check if promo code exists with this order
    if (promoCodeValidationResponse && !promoCodeValidationResponse.error && promoCodeValidationResponse.promoCode) {
      //compare and validate promo discount on total price after all discounts
      let totalPriceWithPromoDiscount = total - (total-50)*(Number(promoCodeValidationResponse.promoCode.discountPercentage)/100);
      //round it up to nearest 5
      totalPriceWithPromoDiscount = Math.ceil(totalPriceWithPromoDiscount/5)*5;
      if (totalPriceWithPromoDiscount !== totalPromoApplied) {
        console.error("ERROR - invalid total price promo code.");
        return next('invalid total price promo code.');
      }
      //save promo info data to the order object.
      order.promoCodeInfo = {
        isPromoCodeUsed: true,
        promoCode: promoCodeValidationResponse.promoCode,
        totalPromoApplied: totalPriceWithPromoDiscount
      };

      // get admin settings to update used "promoCode"
      const response = await adminSettingsCollection.read();
      const adminSettings = response[0].dataValues;
      adminSettings.promoCodes.forEach(promo => {
        if (promo.code == promoCodeValidationResponse.promoCode.code) {
          promo.counter = promo.counter + 1;
          promo.usedByPhoneNumbers.push(phoneNumber);
        }
      });
      await adminSettingsCollection.update(adminSettings.id, adminSettings);

    }

    const orderSummaryMessage = generateOrderSummaryMessage(order);
    const orderSummaryMessageHTML = generateOrderSummaryHTMLMessage(order);
    order.otherInfo.orderSummaryMessage = orderSummaryMessage;
    // save the order
    const response = await bookedAbayaCollection.create(order, next);
    //TODO:
    //un-comment adminEmails.
    // const adminEmails = [process.env.LAMAR_Eamil_1, process.env.LAMAR_Eamil_2];
    const adminEmails = [];
    const userEmail = personalInfo.email;
    const emailsArray = [...adminEmails, userEmail];

    const messageObj = {
      subject: "Lamar Fashion - Order Summary",
      text: orderSummaryMessage,
      html: orderSummaryMessageHTML
    }
    //send emails for admin and user with order summary message.
    nodemailerCaller(messageObj, emailsArray).catch(console.error);

    //notify admin by Whatsapp for the new order
    //notify the user by his phone number Whatsapp for his order details.
    const userPhone = personalInfo.phone;
    // const adminPhone = process.env.LAMAR_Phone_Number; //TODO: add admin phone
    const whatsappNumbers = [userPhone];
    //loop over phone numbers to send whatsapp messages.
    for (let i = 0; i < whatsappNumbers.length; i++) {
      client.messages
      .create({
        from: `whatsapp:${process.env.Twilio_Phone_Number_Sender_WHATSAPP}`,
        body: "Lamar Fashion - Order Summary\n\n" + orderSummaryMessage,
        to: `whatsapp:${whatsappNumbers[i]}`
      })
      .then(message => console.log('whatsapp message sent: ', message.sid))
      .catch(err => console.error("ERROR: Whatsapp API Send order summary error: ",err));
      
    };

    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - submit order - server error: ", e);
    next('submit order - server error');
  };
};

// get all Products handler
async function allProductsHandler(req, res, next) {
  try {
    const products = await abayaCollection.read();

    res.status(200).send(products);
  } catch (e) {
    console.error("ERROR - get all products error: ", e);
    next('get all products error');
  }
};
// get one Product handler
async function getProductHandler(req, res, next) {
  const { productId } = req.params;
  try {
    const product = await abayaCollection.read("id", productId);

    res.status(200).send(product);
  } catch (e) {
    console.error("ERROR - get one product error: ", e);
    next('get one product error');
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
  } catch (e) {
    console.error("ERROR - get home products error: ", e);
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
  } catch (e) {
    console.error("ERROR - search products error: ", e);
    next('search products error');
  }
};

//get admin settings handler
async function getAdminSettingsHandler(req, res, next) {
  //TODO: make a private route and authenticate it. remove some data from this opened route. like: promoCodes.
  try {
    // get settings
    const adminSettingsArr = await adminSettingsCollection.read();
    const adminSettings = adminSettingsArr[0]?.dataValues;
    //check and update promo codes.
    let isChanged;
    adminSettings.promoCodes.forEach(promo => {
      //check expiration date
      if (promo.expirationDate) {
        const isPromoExpired = checkExpirationDate(promo.expirationDate, new Date());
        if (isPromoExpired) {
          //mark the promo isActive: "false"
          promo.isActive = false;
          isChanged = true;
        }
      }
      //check if max limit reached so mark the promo as inActive
      if (promo.type === "maxLimit" && promo.maxLimit <= promo.counter) {
        promo.isActive = false;
        isChanged = true;
      }
    });

     //check if the adminSettings required by Admin or user. >> so only return promo codes for admin only.
     let hidePromoCodes = true;
     let isAdminLoggedIn = false;
     if (req.headers.authorization) {
       const token = req.headers.authorization.split(' ').pop();
       // check the token with the original one by the username & the SECRET
       const validUser = await userCollection.model.authenticateToken(token);   

       if (validUser && validUser.dataValues && validUser.dataValues.role === 'admin') {
          isAdminLoggedIn = true;
          hidePromoCodes = false;
       }
     }

    if (isChanged) {
      const updatedSettings = await adminSettingsCollection.update(adminSettings.id, adminSettings);
      if (hidePromoCodes && !isAdminLoggedIn) {
        delete updatedSettings.dataValues.promoCodes;
      }
      res.status(200).send(updatedSettings.dataValues);
      
    } else {
      if (hidePromoCodes && !isAdminLoggedIn) {
        delete adminSettings.promoCodes;
      }
      res.status(200).send(adminSettings);
    }


  } catch (e) {
    console.error("ERROR - get admin settings error: ", e);
    next('get admin settings error');
  }
};

//validate promo code
async function validatePromoCode (req, res, next) {
  const { code, phoneNumber } = req.body;
  const errorMsg = 'Apply Promo Code Error!';
  const promoCodeValidationResponse = {
    error: "Invalid Promo Code.",
    promoCode: null
  };
  const handleMiddlewareResponse = function (responseObj, promoCode, error) {
    responseObj.error = error;
    responseObj.promoCode = promoCode;
    req.body.promoCodeValidationResponse = responseObj;
    next();
  };
  if (!code && !phoneNumber) {
    return handleMiddlewareResponse(promoCodeValidationResponse, null, "Promo Code not attached.");
  }
  try {
    //get admin settings to check the promo.
    const adminSettingsArr = await adminSettingsCollection.read();
    const adminSettings = adminSettingsArr[0]?.dataValues;
    if (!adminSettings) {
      console.error(`ERROR - ${errorMsg}`);
      return next(errorMsg);
    }
    const promoCodes = adminSettings.promoCodes;
    let matchedPromo;
    //check if promo exists
    promoCodes.forEach(promo => {
      if (promo.code === code) {
        matchedPromo = promo;
      }
    });

    if (!matchedPromo) {
      return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);
    }

    if (!matchedPromo.isActive) {
      return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);
    }

    //check expiration date
    if (matchedPromo.expirationDate) {
      const isPromoExpired = checkExpirationDate(matchedPromo.expirationDate, new Date());
      if (isPromoExpired) {
        //mark the promo isActive: "false"
        adminSettings.promoCodes.forEach(promo => {
          if (promo.code === matchedPromo.code) {
            promo.isActive = false;
          }
        });
        await adminSettingsCollection.update(adminSettings.id, adminSettings);
        return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);
      }
    }

    switch (matchedPromo.type) {
      case "noLimit":
        return handleMiddlewareResponse(promoCodeValidationResponse, matchedPromo, null);
        break;
      case "maxLimit":
        if (matchedPromo.maxLimit > matchedPromo.counter) {
          return handleMiddlewareResponse(promoCodeValidationResponse, matchedPromo, null);
        }
        //check if max limit reached so mark the promo as inActive
        if (matchedPromo.maxLimit <= matchedPromo.counter) {
          const adminSettingsArr = await adminSettingsCollection.read();
          const adminSettings = adminSettingsArr[0]?.dataValues;
          adminSettings.promoCodes.forEach(promo => {
            if (promo.code === matchedPromo.code) {
              promo.isActive = false;
            }
          });
          await adminSettingsCollection.update(adminSettings.id, adminSettings);
        }
        break;
      case "oneTimeUse":
        if (!phoneNumber) {
          return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);
        }

        if (matchedPromo.usedByPhoneNumbers.includes(phoneNumber)) {
          return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);
        }
        //otherwise it's a valid promo.
        return handleMiddlewareResponse(promoCodeValidationResponse, matchedPromo, null);
        break;
    
      default:
        break;
    }

    //send error if no case matched.
    return handleMiddlewareResponse(promoCodeValidationResponse, null, errorMsg);

  } catch (err) {
    console.error(`ERROR - ${errorMsg}: `, err);
    next(errorMsg);
  }

};

//apply Promo Code Handler
async function applyPromoCodeHandler (req, res, next) {
  const { promoCodeValidationResponse } = req.body;
  if (!promoCodeValidationResponse?.error && promoCodeValidationResponse?.promoCode) {
    res.status(200).send(promoCodeValidationResponse.promoCode);
  } else {
    console.error(`ERROR - Apply Promo Code Error..`);
    next("Apply Promo Code Error..");
  }
};

//check if Promo code attached
async function checkPromoExists (req, res, next) {
  const {verifiedPromoCode, totalPromoApplied, personalInfo} = req.body;
  if (verifiedPromoCode && totalPromoApplied) {
    req.body.code = verifiedPromoCode.code;
    req.body.phoneNumber = personalInfo?.phone;
  }
  next();
};
// send OTP handler
async function sendOTPHandler (req, res, next) {
  const {phoneNumber} = req.body;
  function generateOTP() {
    const length = 6;
    let otp = '';
  
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
  
    return otp;
  };
  const otp = generateOTP();
  try {
    const message = await client.messages.create({
      body: `Lamar Fashion: Your OTP verification code is: ${otp}`,
      from: process.env.Twilio_Phone_Number_Sender_SMS, // your Twilio phone number.
      to: phoneNumber
    });
    OTPs.set(phoneNumber, otp);
    res.status(200).send({OTP: "OTP Sent Successfully!"});
  } catch (error) {
    console.error("ERROR - Send OTP Error.: ", error);
    next("Send OTP Error.");
  }
};

//verify OTP handler
async function verifyOTPHandler (req, res, next) {
  const { phoneNumber, OTP } = req.body;
  const sentOTP = OTPs.get(phoneNumber);
  if (sentOTP && sentOTP === OTP) {
    res.status(200).send({OTP: "OTP Verified Successfully!"});
  } else {
    console.error("ERROR - Invalid Entered OTP");
    next("Invalid Entered OTP.")
  }
};

module.exports = apiRouter;
