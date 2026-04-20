import { describe, it, expect, beforeEach } from '@jest/globals';
import { CreateVehicleUseCase } from '../../../../../src/application/use-cases/vehicle/methods/CreateVehicleUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('CreateVehicleUseCase', () => {
    let createVehicleUseCase: CreateVehicleUseCase;
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

        createVehicleUseCase = new CreateVehicleUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        const validLicensePlate = 'ABC1D23';
        const validBrand = 'Toyota';
        const validModel = 'Corolla';
        const validYear = 2023;

        it('should create a vehicle with valid data', async () => {
            const mockVehicle = new Vehicle({
                id: '1',
                licensePlate: validLicensePlate,
                brand: validBrand,
                model: validModel,
                year: validYear,
            });

            mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
            mockVehicleRepository.create.mockResolvedValue(mockVehicle);

            const result = await createVehicleUseCase.execute(
                validLicensePlate,
                validBrand,
                validModel,
                validYear
            );

            expect(result).toEqual(mockVehicle);
            expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(validLicensePlate);
            expect(mockVehicleRepository.create).toHaveBeenCalled();
        });

        it('should throw error for invalid license plate', async () => {
            const invalidLicensePlate = 'INVALID123';

            await expect(
                createVehicleUseCase.execute(invalidLicensePlate, validBrand, validModel, validYear)
            ).rejects.toThrow('Invalid Brazilian license plate');
        });

        it('should throw error when vehicle with same license plate already exists', async () => {
            const existingVehicle = new Vehicle({
                id: '1',
                licensePlate: validLicensePlate,
                brand: 'Honda',
                model: 'Civic',
                year: 2022,
            });

            mockVehicleRepository.findByLicensePlate.mockResolvedValue(existingVehicle);

            await expect(
                createVehicleUseCase.execute(validLicensePlate, validBrand, validModel, validYear)
            ).rejects.toThrow('Vehicle with this license plate already exists');

            expect(mockVehicleRepository.create).not.toHaveBeenCalled();
        });

        it('should use old format license plate (LLLNNNN)', async () => {
            const oldFormatPlate = 'XYZ9876';
            const mockVehicle = new Vehicle({
                id: '2',
                licensePlate: oldFormatPlate,
                brand: validBrand,
                model: validModel,
                year: validYear,
            });

            mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
            mockVehicleRepository.create.mockResolvedValue(mockVehicle);

            const result = await createVehicleUseCase.execute(
                oldFormatPlate,
                validBrand,
                validModel,
                validYear
            );

            expect(result).toEqual(mockVehicle);
            expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(oldFormatPlate);
        });
    });
});
