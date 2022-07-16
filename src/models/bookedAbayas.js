'use strict';

const BookedAbayaSchema = (sequelize, DataTypes) => {
  // create userSchema / Table
  const Schema = sequelize.define('bookedAbayas', {
    productInfo: { type: DataTypes.ARRAY(DataTypes.JSON), require: true, defaultValue: [] },
    personalInfo: { type: DataTypes.JSON, defaultValue: {}, require: true },
    totalPrice: { type: DataTypes.STRING, require: true },
    paymentMethod: { type: DataTypes.STRING, require: true, defaultValue: 'cash on delivery' },
    orderStatus: { type: DataTypes.STRING, require: true, defaultValue: 'pending' },
    orderId: { type: DataTypes.STRING, require: true },
  });
  return Schema;
};

module.exports = BookedAbayaSchema;
