"use strict"

const BookedAbayaSchema = (sequelize, DataTypes) => {
    // create userSchema / Table
    const Schema = sequelize.define('bookedAbayas', {
        productInfo: { type: DataTypes.ARRAY(DataTypes.JSON), require: true, defaultValue: [] },
        personalInfo: { type: DataTypes.JSON, defaultValue: {}, require: true },
        comment: { type: DataTypes.STRING },
        totalPrice: { type: DataTypes.STRING, require: true },
        paymentMethod: { type: DataTypes.STRING, require: true },
        IsPaidSuccessfully: { type: DataTypes.BOOLEAN, require: true },
        orderStatus: { type: DataTypes.STRING, require: true },
        orderId: { type: DataTypes.STRING, require: true },
    })
    return Schema

}

module.exports = BookedAbayaSchema
    /* 

    cart object we will save  just this object  

    {
        color : ... ,
        size : ... ,
        code: ... ,
        quantity : ... ,
        buttons: ... ,
        tall : ... ,
        status : ... ,
        delivery Time: ... ,
        in Stock Qnt : ... ,
        availability:...,
        category : .. ,
        image : ... ,
        price:...


    }

    info object we will save  just this object  

    {
        firstName : ... ,
        lastName : ... ,
        Email: ... ,
        phone : ... ,
        country: ... ,
        city : ... , 
        zone : ... ,
        faltNumber : ... 
    }

    */