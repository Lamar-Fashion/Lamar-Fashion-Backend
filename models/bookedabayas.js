'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bookedAbayas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  bookedAbayas.init({
    productInfo: DataTypes.ARRAY,
    personalInfo: DataTypes.JSON,
    totalPrice: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    orderStatus: DataTypes.STRING,
    orderId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bookedAbayas',
  });
  return bookedAbayas;
};