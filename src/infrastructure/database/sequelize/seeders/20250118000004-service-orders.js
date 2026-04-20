'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingOrders] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM service_orders;`
    );

    if (existingOrders[0].count > 0) return;

    // Buscar os usuários customers
    const customers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'customer' ORDER BY "createdAt" ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (customers.length === 0) {
      console.warn('Nenhum usuário customer encontrado.');
      return;
    }

    // Buscar todos os veículos
    const vehicles = await queryInterface.sequelize.query(
      `SELECT id FROM vehicles ORDER BY "createdAt" ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (vehicles.length === 0) {
      console.warn('Nenhum veículo encontrado.');
      return;
    }

    // Buscar os serviços
    const services = await queryInterface.sequelize.query(
      `SELECT id FROM services ORDER BY "createdAt" ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Buscar as peças
    const parts = await queryInterface.sequelize.query(
      `SELECT id FROM parts ORDER BY "createdAt" ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Obter o próximo número de ordem de serviço
    const lastOrder = await queryInterface.sequelize.query(
      `SELECT "serviceOrderNumber" FROM service_orders ORDER BY "serviceOrderNumber" DESC LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let nextOrderNumber = 1000;
    if (lastOrder.length > 0) {
      nextOrderNumber = lastOrder[0].serviceOrderNumber + 1;
    }

    // Função para gerar um número aleatório entre min e max
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Função para selecionar n elementos aleatórios de um array
    const getRandomElements = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    // Função para gerar uma data aleatória nos últimos 12 meses
    const getRandomDateInLast12Months = () => {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const randomTime = Math.random() * (now.getTime() - oneYearAgo.getTime()) + oneYearAgo.getTime();
      return new Date(randomTime);
    }

    // Criar as ordens de serviço
    const serviceOrders = [];
    const serviceOrderServices = [];
    const serviceOrderParts = [];
    const usedVehicles = new Set();
    const userVehicleCombinations = new Set(); // Para rastrear combinações de usuário+veículo

    // Criar ordens iniciais (uma para cada cliente)
    customers.forEach((customer, index) => {
      // Selecionar um veículo aleatório que não foi usado ainda
      let vehicleForOrder = null;
      const availableVehicles = vehicles.filter(v => !usedVehicles.has(v.id));

      if (availableVehicles.length > 0) {
        vehicleForOrder = availableVehicles[getRandomInt(0, availableVehicles.length - 1)];
        usedVehicles.add(vehicleForOrder.id);
      } else {
        // Se todos os veículos foram usados, selecionar um aleatório
        vehicleForOrder = vehicles[getRandomInt(0, vehicles.length - 1)];
      }

      const soId = uuidv4();
      const soNumber = nextOrderNumber + index;

      // Criar a order de serviço
      serviceOrders.push({
        id: soId,
        userId: customer.id,
        vehicleId: vehicleForOrder.id,
        serviceOrderNumber: soNumber,
        status: 'Recebido',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userVehicleCombinations.add(`${customer.id}_${vehicleForOrder.id}`);

      // Adicionar 1-3 serviços aleatoriamente
      if (services.length > 0) {
        const servicesCount = getRandomInt(1, Math.min(3, services.length));
        const randomServices = getRandomElements(services, servicesCount);

        randomServices.forEach((service) => {
          serviceOrderServices.push({
            id: uuidv4(),
            serviceOrderId: soId,
            serviceId: service.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }

      // Adicionar 0-3 peças aleatoriamente
      if (parts.length > 0) {
        const partsCount = getRandomInt(0, Math.min(3, parts.length));
        const randomParts = getRandomElements(parts, partsCount);

        randomParts.forEach((part) => {
          serviceOrderParts.push({
            id: uuidv4(),
            serviceOrderId: soId,
            partId: part.id,
            quantity: getRandomInt(1, 3),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    });

    // Criar ordens completas no passado (12 meses)
    const completedOrderCount = 15; // 15 ordens completas no passado
    for (let i = 0; i < completedOrderCount; i++) {
      let customer, vehicle;
      let combinationKey;

      // Garantir que não há mesma combinação de usuário+veículo
      do {
        customer = customers[getRandomInt(0, customers.length - 1)];
        vehicle = vehicles[getRandomInt(0, vehicles.length - 1)];
        combinationKey = `${customer.id}_${vehicle.id}`;
      } while (userVehicleCombinations.has(combinationKey));

      userVehicleCombinations.add(combinationKey);

      const soId = uuidv4();
      const soNumber = nextOrderNumber + customers.length + i;

      // Gerar datas no passado
      const startedServiceAt = getRandomDateInLast12Months();
      const randomHours = getRandomInt(1, 6);
      const endedServiceAt = new Date(startedServiceAt.getTime() + randomHours * 60 * 60 * 1000);

      // Criar a order de serviço finalizada
      serviceOrders.push({
        id: soId,
        userId: customer.id,
        vehicleId: vehicle.id,
        serviceOrderNumber: soNumber,
        status: 'Finalizado',
        startedServiceAt: startedServiceAt,
        endedServiceAt: endedServiceAt,
        createdAt: startedServiceAt,
        updatedAt: new Date(),
      });

      // Adicionar 1-3 serviços aleatoriamente
      if (services.length > 0) {
        const servicesCount = getRandomInt(1, Math.min(3, services.length));
        const randomServices = getRandomElements(services, servicesCount);

        randomServices.forEach((service) => {
          serviceOrderServices.push({
            id: uuidv4(),
            serviceOrderId: soId,
            serviceId: service.id,
            createdAt: startedServiceAt,
            updatedAt: new Date(),
          });
        });
      }

      // Adicionar 0-3 peças aleatoriamente
      if (parts.length > 0) {
        const partsCount = getRandomInt(0, Math.min(3, parts.length));
        const randomParts = getRandomElements(parts, partsCount);

        randomParts.forEach((part) => {
          serviceOrderParts.push({
            id: uuidv4(),
            serviceOrderId: soId,
            partId: part.id,
            quantity: getRandomInt(1, 3),
            createdAt: startedServiceAt,
            updatedAt: new Date(),
          });
        });
      }
    }

    // Inserir os dados
    if (serviceOrders.length > 0) {
      await queryInterface.bulkInsert('service_orders', serviceOrders);
    }

    if (serviceOrderServices.length > 0) {
      await queryInterface.bulkInsert('service_order_services', serviceOrderServices);
    }

    if (serviceOrderParts.length > 0) {
      await queryInterface.bulkInsert('service_order_parts', serviceOrderParts);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_order_parts', null, {});
    await queryInterface.bulkDelete('service_order_services', null, {});
    await queryInterface.bulkDelete('service_orders', { serviceOrderNumber: { [Sequelize.Op.gte]: 1000 } }, {});
  },
};
