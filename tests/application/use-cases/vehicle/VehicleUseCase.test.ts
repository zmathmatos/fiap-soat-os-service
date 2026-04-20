import { describe, it, expect, beforeEach } from '@jest/globals';
import { VehicleUseCase } from '../../../../src/application/use-cases/vehicle/VehicleUseCase';
import { CreateVehicleUseCase } from '../../../../src/application/use-cases/vehicle/methods/CreateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../../../src/application/use-cases/vehicle/methods/DeleteVehicleUseCase';
import { GetAllVehiclesUseCase } from '../../../../src/application/use-cases/vehicle/methods/GetAllVehiclesUseCase';
import { GetVehicleByIdUseCase } from '../../../../src/application/use-cases/vehicle/methods/GetVehicleByIdUseCase';
import { GetVehicleByLicensePlateUseCase } from '../../../../src/application/use-cases/vehicle/methods/GetVehicleByLicensePlateUseCase';
import { UpdateVehicleUseCase } from '../../../../src/application/use-cases/vehicle/methods/UpdateVehicleUseCase';
import type { IVehicleRepository } from '../../../../src/domain/repositories/IVehicleRepository';

describe('VehicleUseCase', () => {
  let vehicleUseCase: VehicleUseCase;
  let mockVehicleRepository: jest.Mocked<IVehicleRepository>;

  beforeEach(() => {
    mockVehicleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByLicensePlate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    vehicleUseCase = new VehicleUseCase(mockVehicleRepository);
  });

  describe('constructor', () => {
    it('should initialize all use cases', () => {
      expect(vehicleUseCase.create).toBeInstanceOf(CreateVehicleUseCase);
      expect(vehicleUseCase.delete).toBeInstanceOf(DeleteVehicleUseCase);
      expect(vehicleUseCase.getAll).toBeInstanceOf(GetAllVehiclesUseCase);
      expect(vehicleUseCase.getById).toBeInstanceOf(GetVehicleByIdUseCase);
      expect(vehicleUseCase.getByLicensePlate).toBeInstanceOf(
        GetVehicleByLicensePlateUseCase
      );
      expect(vehicleUseCase.update).toBeInstanceOf(UpdateVehicleUseCase);
    });
  });

  describe('buildCreateVehicleUseCase', () => {
    it('should create and return CreateVehicleUseCase instance', () => {
      const createUseCase = vehicleUseCase['buildCreateVehicleUseCase']();
      expect(createUseCase).toBeInstanceOf(CreateVehicleUseCase);
    });
  });

  describe('buildDeleteVehicleUseCase', () => {
    it('should create and return DeleteVehicleUseCase instance', () => {
      const deleteUseCase = vehicleUseCase['buildDeleteVehicleUseCase']();
      expect(deleteUseCase).toBeInstanceOf(DeleteVehicleUseCase);
    });
  });

  describe('buildGetAllVehiclesUseCase', () => {
    it('should create and return GetAllVehiclesUseCase instance', () => {
      const getAllUseCase = vehicleUseCase['buildGetAllVehiclesUseCase']();
      expect(getAllUseCase).toBeInstanceOf(GetAllVehiclesUseCase);
    });
  });

  describe('buildGetVehicleByIdUseCase', () => {
    it('should create and return GetVehicleByIdUseCase instance', () => {
      const getByIdUseCase = vehicleUseCase['buildGetVehicleByIdUseCase']();
      expect(getByIdUseCase).toBeInstanceOf(GetVehicleByIdUseCase);
    });
  });

  describe('buildGetVehicleByLicensePlateUseCase', () => {
    it('should create and return GetVehicleByLicensePlateUseCase instance', () => {
      const getByPlateUseCase = vehicleUseCase['buildGetVehicleByLicensePlateUseCase']();
      expect(getByPlateUseCase).toBeInstanceOf(GetVehicleByLicensePlateUseCase);
    });
  });

  describe('buildUpdateVehicleUseCase', () => {
    it('should create and return UpdateVehicleUseCase instance', () => {
      const updateUseCase = vehicleUseCase['buildUpdateVehicleUseCase']();
      expect(updateUseCase).toBeInstanceOf(UpdateVehicleUseCase);
    });
  });
});
