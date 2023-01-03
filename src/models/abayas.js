"use strict"


const AbayaSchema = (sequelize, DataTypes) => {
    // create userSchema / Table
    const Schema = sequelize.define('abayas', {
        colors: { type: DataTypes.ARRAY(DataTypes.STRING), required: true, defaultValue: [] },
        sizes: { type: DataTypes.ARRAY(DataTypes.STRING), required: true, defaultValue: [] },
        images: { type: DataTypes.ARRAY(DataTypes.STRING), required: true, defaultValue: [] },
        category: { type: DataTypes.STRING, required: true },
        code: { type: DataTypes.STRING, required: true },
        price: { type: DataTypes.STRING, required: true },
        discount: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING, required: true },
        description: { type: DataTypes.STRING, required: true },
        inStock: { type: DataTypes.STRING, required: true },
        addToHomePage: { type: DataTypes.BOOLEAN, required: true },

    })
    return Schema
}

module.exports = AbayaSchema