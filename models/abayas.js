'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class abayas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  abayas.init({
    colors: DataTypes.ARRAY,
    sizes: DataTypes.ARRAY,
    images: DataTypes.ARRAY,
    category: DataTypes.STRING,
    code: DataTypes.STRING,
    price: DataTypes.STRING,
    discount: DataTypes.STRING,
    status: DataTypes.STRING,
    description: DataTypes.STRING,
    inStock: DataTypes.STRING,
    addToHomePage: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'abayas',
  });
  return abayas;
};