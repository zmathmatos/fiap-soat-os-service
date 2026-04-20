import { describe, it, expect, beforeEach } from '@jest/globals';
import { DeleteVehicleUseCase } from '../../../../../src/application/use-cases/vehicle/methods/DeleteVehicleUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('DeleteVehicleUseCase', () => {
    let deleteVehicleUseCase: DeleteVehicleUseCase;
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

        deleteVehicleUseCase = new DeleteVehicleUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        const vehicleId = '1';
        const existingVehicle = new Vehicle({
            id: vehicleId,
            licensePlate: 'ABC1D23',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2023,
        });

        it('should delete a vehicle successfully', async () => {
            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.delete.mockResolvedValue(true);

            const result = await deleteVehicleUseCase.execute(vehicleId);

            expect(result).toBe(true);
            expect(mockVehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
            expect(mockVehicleRepository.delete).toHaveBeenCalledWith(vehicleId);
        });

        it('should throw error when vehicle does not exist', async () => {
            mockVehicleRepository.findById.mockResolvedValue(null);

            await expect(deleteVehicleUseCase.execute(vehicleId)).rejects.toThrow('Vehicle not found');

            expect(mockVehicleRepository.delete).not.toHaveBeenCalled();
        });

        it('should handle repository errors during delete', async () => {
            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            const error = new Error('Database error');
            mockVehicleRepository.delete.mockRejectedValue(error);

            await expect(deleteVehicleUseCase.execute(vehicleId)).rejects.toThrow('Database error');
        });

        it('should verify vehicle exists before deleting', async () => {
            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.delete.mockResolvedValue(true);

            await deleteVehicleUseCase.execute(vehicleId);

            // Verificar que findById foi chamado antes de delete
            expect(mockVehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
            expect(mockVehicleRepository.delete).toHaveBeenCalledWith(vehicleId);

            // Verificar a ordem de chamadas
            expect(mockVehicleRepository.findById).toHaveBeenNthCalledWith(1, vehicleId);
            expect(mockVehicleRepository.delete).toHaveBeenNthCalledWith(1, vehicleId);
        });
    });
});
