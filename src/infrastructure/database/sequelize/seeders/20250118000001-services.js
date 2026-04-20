'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingServices] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM services;`
    );

    if (existingServices[0].count > 0) return;

    await queryInterface.bulkInsert('services', [
      {
        id: uuidv4(),
        name: 'Alinhamento de Suspensão',
        serviceCode: 'ALIGN-001',
        price: 150.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Balanceamento de Rodas',
        serviceCode: 'BALANCE-001',
        price: 100.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Troca de Óleo e Filtros',
        serviceCode: 'OIL-CHANGE-001',
        price: 120.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Diagnóstico Eletrônico',
        serviceCode: 'DIAG-001',
        price: 80.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Substituição de Pastilhas de Freio',
        serviceCode: 'BRAKE-PAD-001',
        price: 200.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  },
};
