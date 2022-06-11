// Admin controllers

// import models
const { favouritCollection, bookedAbayaCollection, abayaCollection, userCollection } = require('../models/index');
let abaya = {
  productIamges: [
    'https://firebasestorage.googleapis.com/v0/b/lamar-fashion.appspot.com/o/products%2F23-5-2022%406%3A51%20-%20UTv4UbCw.jpeg?alt=media&token=e3892239-e32b-4fb1-b59c-00df57cd6e79',
    'https://firebasestorage.googleapis.com/v0/b/lamar-fashion.appspot.com/o/products%2F23-5-2022%406%3A51%20-%20ready-to-wear.jpeg?alt=media&token=58f8abfb-98ec-4e19-9f4d-31db0ba62c32',
  ],
  category: 'newArrivals',
  status: 'notReadyToWear',
  code: 'alg564',
  description: 'product desc sample',
  price: '1200',
  colors: [
    {
      value: 'XS',
      label: 'XS',
    },
    {
      value: 'S',
      label: 'S',
    },
  ],
  sizes: [
    {
      value: 'blue',
      label: 'Blue',
    },
    {
      value: 'purple',
      label: 'Purple',
    },
  ],
  totalInStock: '10',
  addToHomePage: 'yes',
};

// add new product handler
async function addProductHandler(req, res, next) {
  const { productIamges, category, status, code, description, price, colors, sizes, totalInStock, addToHomePage } = req.body;

  const product = {
    colors: colors,
    sizes: sizes,
    images: productIamges,
    category: category,
    code: code,
    price: price,
    status: status,
    description: description,
    inStock: totalInStock,
    addToHomePage: addToHomePage,
  };
  try {
    // save product object
    const response = await abayaCollection.create(product);
    console.log('response', response);

    // return the object to the client
    res.status(201).send(response);
  } catch (e) {
    next(e.message, 'add product error');
  }
}

module.exports = {
  addProductHandler,
  //   editProductHandler,
  //   deleteProductHandler,
  //   editOrderHandler,
  //   getPendingOrdersHandler,
  //   getDoneOrdersHandler,
  //   getRejectedOrdersHandler,
  //   getAllUsersHandler,
};
