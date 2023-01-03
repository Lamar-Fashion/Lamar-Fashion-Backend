// Admin controllers

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection, userCollection, adminSettingsCollection } = require('../models/index');

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
    console.log('response', response);

    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    next('add product error');
  }
};
//edit product handler
async function editProductHandler(req, res, next) {
  try {
    const {id} =req.params;
    // edit product 
    const response = await abayaCollection.update(id,req.body);
    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
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
    next('edit order error');
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
  getAdminSettingsHandler,
  addAdminSettingsHandler,
  editAdminSettingsHandler
};
