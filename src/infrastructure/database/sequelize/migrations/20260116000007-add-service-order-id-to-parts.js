'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('service_order_parts', 'serviceOrderId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addIndex('service_order_parts', ['serviceOrderId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('service_order_parts', ['serviceOrderId']);
    await queryInterface.removeColumn('service_order_parts', 'serviceOrderId');
  }
};
