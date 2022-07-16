'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favourites extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  favourites.init({
    abayaId: DataTypes.ARRAY,
    userId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'favourites',
  });
  return favourites;
};