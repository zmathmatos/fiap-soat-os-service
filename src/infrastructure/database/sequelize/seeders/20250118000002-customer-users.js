'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingCustomers] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'customer';`
    );

    if (existingCustomers[0].count > 0) return;

    const salt = await bcrypt.genSalt(10);
    const customers = [
      {
        id: uuidv4(),
        name: 'João Silva Santos',
        document: '52998224725',
        email: 'joao.silva@email.com',
        password: await bcrypt.hash('senha123', salt),
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Maria Oliveira Costa',
        document: '48321907504',
        email: 'maria.oliveira@email.com',
        password: await bcrypt.hash('senha456', salt),
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Pedro Gomes Ferreira',
        document: '11222333000181',
        email: 'pedro.gomes@email.com',
        password: await bcrypt.hash('senha789', salt),
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', customers);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'customer',
    }, {});
  },
};
