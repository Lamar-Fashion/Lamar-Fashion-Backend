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
const POSTGRES_URI = process.env.DATABASE_URL || 'postgres://localhost:5432/lamar';

// const sequelize = new Sequelize({
//   database: "dfh2p2kvjg08tf",
//   username: "kglhgcjpspjlvl",
//   password: "a06d032fdc5457c89f20ccff0209704f76cfc77014889bff6663fcc1db059f38",
//   host: "ec2-34-242-84-130.eu-west-1.compute.amazonaws.com",
//   port: 5432,
//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true, // This will help you. But you will see nwe error
//       rejectUnauthorized: false // This line will fix new error
//     }
//   },
// });
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
