'use strict';

const BookedAbayaSchema = (sequelize, DataTypes) => {
  // create userSchema / Table
  const Schema = sequelize.define('bookedAbayas', {
    productInfo: { type: DataTypes.ARRAY(DataTypes.JSON), required: true, defaultValue: [] },
    personalInfo: { type: DataTypes.JSON, defaultValue: {}, required: true },
    totalPrice: { type: DataTypes.STRING, required: true },
    promoCodeInfo: { type: DataTypes.JSON, defaultValue: {isPromoCodeUsed: false, promoCode: {}, totalPromoApplied: null }, required: true },
    paymentMethod: { type: DataTypes.STRING, required: true, defaultValue: 'cash on delivery' },
    orderStatus: { type: DataTypes.STRING, required: true, defaultValue: 'pending' },
    orderId: { type: DataTypes.STRING, required: true },
    rejectionNote: { type: DataTypes.STRING, required: true },
  });
  return Schema;
};

module.exports = BookedAbayaSchema;
