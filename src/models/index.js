"use strict";
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const abayas = require("./abayas");
const bookedAbaya = require("./bookedAbayas");
const favourite = require("./favourite");
const users = require("./users");
const Collection = require("./dataCollection");

let sequelizeOptions = {};
const POSTGRES_URI =
    process.env.DATABASE_URI || "postgres://localhost:5432/lamar";

const sequelize = new Sequelize(POSTGRES_URI, sequelizeOptions);

const abayaModel = abayas(sequelize, DataTypes);
const bookedAbayaModel = bookedAbaya(sequelize, DataTypes);
const favouriteModel = favourite(sequelize, DataTypes);
const userModel = users(sequelize, DataTypes);







const userCollection = new Collection(userModel);
const favouritCollection = new Collection(favouriteModel);
const bookedAbayaCollection = new Collection(bookedAbayaModel);
const abayaCollection = new Collection(abayaModel);

module.exports = {
    db: sequelize,
};