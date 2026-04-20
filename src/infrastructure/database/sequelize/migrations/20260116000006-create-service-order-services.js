'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_order_services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      serviceOrderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'service_orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    await queryInterface.addIndex('service_order_services', ['serviceOrderId']);
    await queryInterface.addIndex('service_order_services', ['serviceId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_order_services');
  }
};
