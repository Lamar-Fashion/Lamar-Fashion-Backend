'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('abayas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      colors: {
        type: Sequelize.ARRAY
      },
      sizes: {
        type: Sequelize.ARRAY
      },
      images: {
        type: Sequelize.ARRAY
      },
      category: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      discount: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      inStock: {
        type: Sequelize.STRING
      },
      addToHomePage: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('abayas');
  }
};