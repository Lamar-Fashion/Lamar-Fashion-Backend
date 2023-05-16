"use strict"

const AdminSettingsSchema = (sequelize, DataTypes) => {
    // create admin Settings Schema / Table
    const Schema = sequelize.define('adminSettings', {
        signInDiscount: { type: DataTypes.INTEGER, defaultValue: 0 },
        shippingFees: { type: DataTypes.INTEGER, defaultValue: 50 },
        other: { type: DataTypes.JSONB, defaultValue: {} },
        promoCodes: { type: DataTypes.ARRAY(DataTypes.JSONB), defaultValue: [] }, 
        // promoCodeObj = {
        //   code,
        //   discountPercentage,
        //   type, //noLimit/maxLimit/oneTimeUse >> per phone number.
        //   maxLimit, 
        //   counter: 0,
        //   usedByPhoneNumbers: [],
        //   expirationDate,
        //   isActive: true
        // };
        hero: { type: DataTypes.JSONB, defaultValue: {} },
        collection: { type: DataTypes.JSONB, defaultValue: {} },
    });
    return Schema;
};

module.exports = AdminSettingsSchema;