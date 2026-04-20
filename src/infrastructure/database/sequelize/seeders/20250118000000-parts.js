'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingParts] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM parts;`
    );

    if (existingParts[0].count > 0) return;

    await queryInterface.bulkInsert('parts', [
      {
        id: uuidv4(),
        name: 'Pneu Michelin Pilot Sport',
        partNumber: 'PS-225-45R18',
        brand: 'Michelin',
        price: 450.00,
        stockQuantity: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Bateria Moura 60Ah',
        partNumber: 'BAT-MOURA-60',
        brand: 'Moura',
        price: 380.00,
        stockQuantity: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Filtro de Ar Motor Bosch',
        partNumber: 'FAR-BOSCH-001',
        brand: 'Bosch',
        price: 85.00,
        stockQuantity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Oleo Sintetico Castrol 5W30',
        partNumber: 'OLE-CASTROL-5W30',
        brand: 'Castrol',
        price: 65.00,
        stockQuantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Correia Dentada Dayco',
        partNumber: 'COR-DAYCO-001',
        brand: 'Dayco',
        price: 320.00,
        stockQuantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('parts', null, {});
  },
};
