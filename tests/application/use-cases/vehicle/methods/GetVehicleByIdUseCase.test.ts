import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetVehicleByIdUseCase } from '../../../../../src/application/use-cases/vehicle/methods/GetVehicleByIdUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('GetVehicleByIdUseCase', () => {
    let getVehicleByIdUseCase: GetVehicleByIdUseCase;
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

        getVehicleByIdUseCase = new GetVehicleByIdUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        it('should return a vehicle by id', async () => {
            const vehicleId = '1';
            const mockVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
            });

            mockVehicleRepository.findById.mockResolvedValue(mockVehicle);

            const result = await getVehicleByIdUseCase.execute(vehicleId);

            expect(result).toEqual(mockVehicle);
            expect(mockVehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
        });

        it('should return null when vehicle does not exist', async () => {
            const vehicleId = '999';
            mockVehicleRepository.findById.mockResolvedValue(null);

            const result = await getVehicleByIdUseCase.execute(vehicleId);

            expect(result).toBeNull();
            expect(mockVehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
        });

        it('should handle repository errors', async () => {
            const vehicleId = '1';
            const error = new Error('Database error');
            mockVehicleRepository.findById.mockRejectedValue(error);

            await expect(getVehicleByIdUseCase.execute(vehicleId)).rejects.toThrow('Database error');
        });
    });
});
