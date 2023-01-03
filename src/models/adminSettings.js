"use strict"

const AdminSettingsSchema = (sequelize, DataTypes) => {
    // create admin Settings Schema / Table
    const Schema = sequelize.define('adminSettings', {
        signInDiscount: { type: DataTypes.INTEGER, defaultValue: 10 },
        promoCodes: { type: DataTypes.ARRAY(DataTypes.JSON), defaultValue: [] },
        hero: { type: DataTypes.JSON, defaultValue: {} },
        collection: { type: DataTypes.JSON, defaultValue: {} },
    });
    return Schema
};

module.exports = AdminSettingsSchema;