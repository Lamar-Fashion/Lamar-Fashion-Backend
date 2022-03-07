"use strict"

const FavouriteSchema = (sequelize, DataTypes) => {
    const Schema = sequelize.define('favourite', {
        abayaId: { type: DataTypes.INTEGER },

        userId: { type: DataTypes.INTEGER }
    })
    return Schema
}

module.exports = FavouriteSchema