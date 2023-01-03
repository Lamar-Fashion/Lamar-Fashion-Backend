'use strict';

const FavouriteSchema = (sequelize, DataTypes) => {
  const Schema = sequelize.define('favourites', {
    abayaId: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    userId: { type: DataTypes.STRING, required: true, unique: true },
  });
  return Schema;
};

module.exports = FavouriteSchema;
