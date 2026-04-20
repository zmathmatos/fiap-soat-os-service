import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetAllVehiclesUseCase } from '../../../../../src/application/use-cases/vehicle/methods/GetAllVehiclesUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('GetAllVehiclesUseCase', () => {
    let getAllVehiclesUseCase: GetAllVehiclesUseCase;
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

        getAllVehiclesUseCase = new GetAllVehiclesUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        it('should return all vehicles', async () => {
            const mockVehicles = [
                new Vehicle({
                    id: '1',
                    licensePlate: 'ABC1D23',
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2023,
                }),
                new Vehicle({
                    id: '2',
                    licensePlate: 'XYZ9876',
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2022,
                }),
            ];

            mockVehicleRepository.findAll.mockResolvedValue(mockVehicles);

            const result = await getAllVehiclesUseCase.execute();

            expect(result).toEqual(mockVehicles);
            expect(mockVehicleRepository.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no vehicles exist', async () => {
            mockVehicleRepository.findAll.mockResolvedValue([]);

            const result = await getAllVehiclesUseCase.execute();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database error');
            mockVehicleRepository.findAll.mockRejectedValue(error);

            await expect(getAllVehiclesUseCase.execute()).rejects.toThrow('Database error');
        });
    });
});
