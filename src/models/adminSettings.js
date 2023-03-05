"use strict"

const AdminSettingsSchema = (sequelize, DataTypes) => {
    // create admin Settings Schema / Table
    const Schema = sequelize.define('adminSettings', {
        signInDiscount: { type: DataTypes.INTEGER, defaultValue: 10 },
        promoCodes: { type: DataTypes.ARRAY(DataTypes.JSON), defaultValue: [] }, 
        //promoCodeObj = {
            //   code,
            //   discountPercentage,
            //   type, //noLimit/maxLimit/oneTimeUse >> per phone number.
            //   maxLimit, 
            //   counter: 0,
            //   usedByPhoneNumbers: [],
            //   expirationDate,
            //   isActive: true
            // };
        hero: { type: DataTypes.JSON, defaultValue: {} },
        collection: { type: DataTypes.JSON, defaultValue: {} },
    });
    return Schema
};

module.exports = AdminSettingsSchema;