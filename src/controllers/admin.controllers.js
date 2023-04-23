const { generateWishlistAvailableMessage, generateWishlistAvailableHTMLMessage } = require('../helpers');
const { nodemailerCaller } = require('../lib/nodemailer');
const { Op, favouritCollection, bookedAbayaCollection, abayaCollection, userCollection, adminSettingsCollection } = require('../models/index');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// add new product handler
async function addProductHandler(req, res, next) {
  const { productIamges, category, status, code, description, price, discount, colors, sizes, totalInStock, addToHomePage } = req.body;

  const product = {
    colors: colors,
    sizes: sizes,
    images: productIamges,
    category: category,
    code: code,
    price: price,
    discount: discount,
    status: status,
    description: description,
    inStock: totalInStock,
    addToHomePage: addToHomePage,
  };
  try {
    // save product object
    const response = await abayaCollection.create(product,next);

    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - add product error: ", e);
    next('add product error');
  }
};
//edit product handler
async function editProductHandler(req, res, next) {
  try {
    const {id} =req.params;
    //get abaya
    const resp = await abayaCollection.read("id", id);
    const abayaBefore = resp[0].dataValues;
    
    //check if this item was out of stock
    if (abayaBefore && abayaBefore.inStock == 0) {
      //check if it's in stock now
      if (req.body.inStock > 0) {
        //get all users that have this item as favorite to notify them.
        const recordsArr = await favouritCollection.model.findAll({
          attributes: ['userId'],
          where: {
            abayaId: { [Op.contains]: [id] }
          }
        });
        const userIds = [];
        recordsArr.forEach(record => {
          userIds.push(record.dataValues.userId);
        });

        if (userIds.length) {
          //get user email/phone to notify them.
          const dataArr = await userCollection.model.findAll({
            attributes: ['email' ,'phoneNumber'],
            where: {
              id: userIds
            }
          });
          const usersPhoneNumbers = [];
          const usersEmails = [];
          dataArr.forEach(user => {
            usersPhoneNumbers.push(user.dataValues.phoneNumber);
            usersEmails.push(user.dataValues.email);
          });
          const wishlistAvailableMessage = generateWishlistAvailableMessage(req.body);
          const wishlistAvailableMessageHTML = generateWishlistAvailableHTMLMessage(req.body);

          const messageObj = {
            subject: "Lamar Fashion - Wishlist Product Available!",
            text: wishlistAvailableMessage,
            html: wishlistAvailableMessageHTML
          }

          //notify users by email if found
          if (usersEmails.length) {
            nodemailerCaller(messageObj, usersEmails).catch(console.error);
          }
          //notify users by Whatsapp api
          if (usersPhoneNumbers.length) {
            //TODO: allow Twilio to send messages for unverified numbers. (seems cuz it's a trial account. on upgrade it will work)
            //loop over phone numbers to send whatsapp messages.
            for (let i = 0; i < usersPhoneNumbers.length; i++) {
              client.messages
              .create({
                from: `whatsapp:${process.env.Twilio_Phone_Number_Sender_WHATSAPP}`,
                body: "Lamar Fashion - Wishlist Product Available!\n\n" + wishlistAvailableMessage,
                to: `whatsapp:${usersPhoneNumbers[i]}`
              })
              .then(message => console.log('whatsapp message sent: ', message.sid))
              .catch(err => console.error("ERROR: Whatsapp API Send notify product available error: ",err));
              
            };
          }
        }
      }
    }
    // edit product 
    const response = await abayaCollection.update(id,req.body);
    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - edit product error: ", e);
    next('edit product error');
  }
};
//delete product handler
async function deleteProductHandler(req, res, next) {
  try {
    const {id} =req.params;
    // delete product 
    const response = await abayaCollection.delete(id);
    // return deleted object to the client
    res.status(202).json({deletedAt:response});
  } catch (e) {
    console.error("ERROR - delete product error: ", e);
    next('delete product error');
  }
};
//get pending orders handler
async function getPendingOrdersHandler(req, res, next) {
  try {
    // get pending orders
    const response = await bookedAbayaCollection.model.findAll({
      where: {
        orderStatus: 'pending'
      }
    });;

    res.status(200).send(response);
  } catch (e) {
    console.error("ERROR - get pending orders error: ", e);
    next('get pending orders error');
  }
};

//get done orders handler
async function getDoneOrdersHandler(req, res, next) {
  try {
    // get done orders
    const response = await bookedAbayaCollection.model.findAll({
      where: {
        orderStatus: 'done'
      }
    });;

    res.status(200).send(response);
  } catch (e) {
    console.error("ERROR - get done orders error: ", e);
    next('get done orders error');
  }
};
//get rejected orders handler
async function getRejectedOrdersHandler(req, res, next) {
  try {
    // get rejected orders
    const response = await bookedAbayaCollection.model.findAll({
      where: {
        orderStatus: 'rejected'
      }
    });;

    res.status(200).send(response);
  } catch (e) {
    console.error("ERROR - get rejected orders error: ", e);
    next('get rejected orders error');
  }
};
//get all users handler
async function getAllUsersHandler(req, res, next) {
  try {
    // get all users
    const response = await userCollection.read();

    res.status(200).send(response);
  } catch (e) {
    console.error("ERROR - get all users error: ", e);
    next('get all users error');
  }
};

//edit order handler
async function editOrderHandler(req, res, next) {
  try {
    const {id} =req.params;
    // edit product 
    const response = await bookedAbayaCollection.update(id, req.body);
    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - edit order error: ", e);
    next('edit order error');
  }
};


// add admin settings handler
async function addAdminSettingsHandler(req, res, next) {
  const { signInDiscount, promoCodes, hero, collection } = req.body;

  const adminSettings = {
    signInDiscount,
    promoCodes,
    hero,
    collection,
  };
  try {
    // save object
    const response = await adminSettingsCollection.create(adminSettings, next);

    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - post admin settings error: ", e);
    next('post admin settings error', e);
  }
};
//edit admin settings handler
async function editAdminSettingsHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { signInDiscount, promoCodes, hero, collection } = req.body;

    const adminSettings = {
      signInDiscount,
      promoCodes,
      hero,
      collection,
    };
    // edit record 
    const response = await adminSettingsCollection.update(id, adminSettings);
    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    console.error("ERROR - edit admin settings error: ", e);
    next('edit admin settings error', e);
  }
};

module.exports = {
  addProductHandler,
  editProductHandler,
  deleteProductHandler,
  editOrderHandler,
  getPendingOrdersHandler,
  getDoneOrdersHandler,
  getRejectedOrdersHandler,
  getAllUsersHandler,
  addAdminSettingsHandler,
  editAdminSettingsHandler
};
