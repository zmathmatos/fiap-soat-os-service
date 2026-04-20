import { describe, it, expect, beforeEach } from '@jest/globals';
import { UpdateVehicleUseCase } from '../../../../../src/application/use-cases/vehicle/methods/UpdateVehicleUseCase';
import type { IVehicleRepository } from '../../../../../src/domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../../../src/domain/entities/Vehicle';

describe('UpdateVehicleUseCase', () => {
    let updateVehicleUseCase: UpdateVehicleUseCase;
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

        updateVehicleUseCase = new UpdateVehicleUseCase(mockVehicleRepository);
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

        it('should update vehicle brand successfully', async () => {
            const updatedVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Honda',
                model: 'Corolla',
                year: 2023,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.update.mockResolvedValue(updatedVehicle);

            const result = await updateVehicleUseCase.execute(vehicleId, {
                brand: 'Honda',
            });

            expect(result).toEqual(updatedVehicle);
            expect(mockVehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
            expect(mockVehicleRepository.update).toHaveBeenCalledWith(vehicleId, {
                brand: 'Honda',
            });
        });

        it('should update vehicle model successfully', async () => {
            const updatedVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Toyota',
                model: 'Camry',
                year: 2023,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.update.mockResolvedValue(updatedVehicle);

            const result = await updateVehicleUseCase.execute(vehicleId, {
                model: 'Camry',
            });

            expect(result).toEqual(updatedVehicle);
            expect(mockVehicleRepository.update).toHaveBeenCalled();
        });

        it('should update vehicle year successfully', async () => {
            const updatedVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2024,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.update.mockResolvedValue(updatedVehicle);

            const result = await updateVehicleUseCase.execute(vehicleId, {
                year: 2024,
            });

            expect(result).toEqual(updatedVehicle);
        });

        it('should return null when vehicle does not exist', async () => {
            mockVehicleRepository.findById.mockResolvedValue(null);

            const result = await updateVehicleUseCase.execute(vehicleId, { brand: 'Honda' });

            expect(result).toBeNull();

            expect(mockVehicleRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when updating to duplicate license plate', async () => {
            const newLicensePlate = 'XYZ9876';
            const anotherVehicle = new Vehicle({
                id: '2',
                licensePlate: newLicensePlate,
                brand: 'Honda',
                model: 'Civic',
                year: 2022,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.findByLicensePlate.mockResolvedValue(anotherVehicle);

            await expect(
                updateVehicleUseCase.execute(vehicleId, {
                    licensePlate: newLicensePlate,
                })
            ).rejects.toThrow('Vehicle with this license plate already exists');

            expect(mockVehicleRepository.update).not.toHaveBeenCalled();
        });

        it('should allow updating with same license plate', async () => {
            const updatedVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2024,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.update.mockResolvedValue(updatedVehicle);

            const result = await updateVehicleUseCase.execute(vehicleId, {
                licensePlate: 'ABC1D23',
                year: 2024,
            });

            expect(result).toEqual(updatedVehicle);
            expect(mockVehicleRepository.findByLicensePlate).not.toHaveBeenCalled();
            expect(mockVehicleRepository.update).toHaveBeenCalled();
        });

        it('should update multiple fields at once', async () => {
            const updatedVehicle = new Vehicle({
                id: vehicleId,
                licensePlate: 'ABC1D23',
                brand: 'Honda',
                model: 'Accord',
                year: 2024,
            });

            mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
            mockVehicleRepository.update.mockResolvedValue(updatedVehicle);

            const result = await updateVehicleUseCase.execute(vehicleId, {
                brand: 'Honda',
                model: 'Accord',
                year: 2024,
            });

            expect(result).toEqual(updatedVehicle);
            expect(mockVehicleRepository.update).toHaveBeenCalledWith(vehicleId, {
                brand: 'Honda',
                model: 'Accord',
                year: 2024,
            });
        });
    });
});
