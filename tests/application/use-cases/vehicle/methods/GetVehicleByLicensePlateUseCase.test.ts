import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetVehicleByLicensePlateUseCase } from '../../../../../src/application/use-cases/vehicle/methods/GetVehicleByLicensePlateUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('GetVehicleByLicensePlateUseCase', () => {
    let getVehicleByLicensePlateUseCase: GetVehicleByLicensePlateUseCase;
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

        getVehicleByLicensePlateUseCase = new GetVehicleByLicensePlateUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        it('should return a vehicle by license plate (Mercosul format)', async () => {
            const licensePlate = 'ABC1D23';
            const mockVehicle = new Vehicle({
                id: '1',
                licensePlate,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
            });

            mockVehicleRepository.findByLicensePlate.mockResolvedValue(mockVehicle);

            const result = await getVehicleByLicensePlateUseCase.execute(licensePlate);

            expect(result).toEqual(mockVehicle);
            expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(licensePlate);
        });

        it('should return a vehicle by license plate (old format)', async () => {
            const licensePlate = 'XYZ9876';
            const mockVehicle = new Vehicle({
                id: '2',
                licensePlate,
                brand: 'Honda',
                model: 'Civic',
                year: 2022,
            });

            mockVehicleRepository.findByLicensePlate.mockResolvedValue(mockVehicle);

            const result = await getVehicleByLicensePlateUseCase.execute(licensePlate);

            expect(result).toEqual(mockVehicle);
            expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(licensePlate);
        });

        it('should return null when vehicle with license plate does not exist', async () => {
            const licensePlate = 'NOT9999';
            mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);

            const result = await getVehicleByLicensePlateUseCase.execute(licensePlate);

            expect(result).toBeNull();
            expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(licensePlate);
        });

        it('should handle repository errors', async () => {
            const licensePlate = 'ABC1D23';
            const error = new Error('Database error');
            mockVehicleRepository.findByLicensePlate.mockRejectedValue(error);

            await expect(
                getVehicleByLicensePlateUseCase.execute(licensePlate)
            ).rejects.toThrow('Database error');
        });
    });
});
