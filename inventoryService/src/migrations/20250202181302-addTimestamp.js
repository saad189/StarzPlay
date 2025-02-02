"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("inventory", "timestamp", {
      type: Sequelize.DATE,
      allowNull: false, // Or true, depending on your requirements
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"), // Optional, sets default value
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("inventory", "timestamp");
  },
};
