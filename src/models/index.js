'use strict';
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const abayas = require('./abayas');
const bookedAbaya = require('./bookedAbayas');
const favourite = require('./favourite');
const users = require('./users');
const Collection = require('./dataCollection');
console.log('users', users);

let sequelizeOptions = {  dialectOptions: {
  ssl: {
    require: true, // This will help you. But you will see nwe error
    rejectUnauthorized: false // This line will fix new error
  }
},};

process.env.NODE_ENV == 'development' ? sequelizeOptions= {} : sequelizeOptions;
// sequelizeOptions= {};
const POSTGRES_URI = process.env.DATABASE_URL || 'postgres://localhost:5432/lamar';
console.log('process.env.NODE_ENV',process.env.NODE_ENV);
console.log('sequelizeOptions',sequelizeOptions);
const sequelize = new Sequelize(POSTGRES_URI, sequelizeOptions);

// models
const abayaModel = abayas(sequelize, DataTypes);
const bookedAbayaModel = bookedAbaya(sequelize, DataTypes);
const favouriteModel = favourite(sequelize, DataTypes);
const userModel = users(sequelize, DataTypes);

// collections
const userCollection = new Collection(userModel);
const favouritCollection = new Collection(favouriteModel);
const bookedAbayaCollection = new Collection(bookedAbayaModel);
const abayaCollection = new Collection(abayaModel);

module.exports = {
  db: sequelize,
  userCollection,
  favouritCollection,
  bookedAbayaCollection,
  abayaCollection,
};
