'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      required: true,
      unique: true,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
