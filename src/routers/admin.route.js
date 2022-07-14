'use strict';

const express = require('express');

// use express Router
const adminRouter = express.Router();

// import basicAuth middleware
const bearerAuth = require('../middlewares/bearerAuth');

// access control list middleware
const permissions = require('../middlewares/acl');

// import controllers
const {
    addProductHandler,
    editProductHandler,
    deleteProductHandler,
    editOrderHandler,
    getPendingOrdersHandler,
    getDoneOrdersHandler,
    getRejectedOrdersHandler,
    getAllUsersHandler,
} = require('../controllers/admin.controllers');

// admin routes
adminRouter.post('/product', bearerAuth, permissions('write'), addProductHandler);
adminRouter.put('/product:id', bearerAuth, permissions('edit'), editProductHandler);
adminRouter.delete('/product:id', bearerAuth, permissions('delete'), deleteProductHandler);
adminRouter.put('/order:id', bearerAuth, permissions('edit'), editOrderHandler);
adminRouter.get('/pendingOrders', bearerAuth, permissions('read'), getPendingOrdersHandler);
adminRouter.get('/doneOrders', bearerAuth, permissions('read'), getDoneOrdersHandler);
adminRouter.get('/rejectedOrders', bearerAuth, permissions('read'), getRejectedOrdersHandler);
adminRouter.get('/users', bearerAuth, permissions('read'), getAllUsersHandler);

module.exports = adminRouter;
