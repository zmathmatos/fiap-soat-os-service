'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingVehicles] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM vehicles;`
    );

    if (existingVehicles[0].count > 0) return;

    const vehicles = [
      {
        id: uuidv4(),
        licensePlate: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        licensePlate: 'ABC-5678',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        licensePlate: 'XYZ-1234',
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2023,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        licensePlate: 'XYZ-5678',
        brand: 'Volkswagen',
        model: 'Gol',
        year: 2020,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        licensePlate: 'DEF-1234',
        brand: 'Hyundai',
        model: 'HB20',
        year: 2022,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        licensePlate: 'DEF-5678',
        brand: 'Fiat',
        model: 'Uno',
        year: 2019,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('vehicles', vehicles);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicles', null, {});
  },
};
