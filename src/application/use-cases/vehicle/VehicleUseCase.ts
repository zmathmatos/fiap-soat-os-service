import { CreateVehicleUseCase } from "./methods/CreateVehicleUseCase";
import { DeleteVehicleUseCase } from "./methods/DeleteVehicleUseCase";
import { GetAllVehiclesUseCase } from "./methods/GetAllVehiclesUseCase";
import { GetVehicleByIdUseCase } from "./methods/GetVehicleByIdUseCase";
import { GetVehicleByLicensePlateUseCase } from "./methods/GetVehicleByLicensePlateUseCase";
import { UpdateVehicleUseCase } from "./methods/UpdateVehicleUseCase";
import type { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";

export class VehicleUseCase {
    readonly create: CreateVehicleUseCase;
    readonly delete: DeleteVehicleUseCase;
    readonly getAll: GetAllVehiclesUseCase;
    readonly getById: GetVehicleByIdUseCase;
    readonly getByLicensePlate: GetVehicleByLicensePlateUseCase;
    readonly update: UpdateVehicleUseCase;

    private vehicleRepository: IVehicleRepository;

    constructor(vehicleRepository: IVehicleRepository) {
        this.vehicleRepository = vehicleRepository;

        this.create = this.buildCreateVehicleUseCase();
        this.delete = this.buildDeleteVehicleUseCase();
        this.getAll = this.buildGetAllVehiclesUseCase();
        this.getById = this.buildGetVehicleByIdUseCase();
        this.getByLicensePlate = this.buildGetVehicleByLicensePlateUseCase();
        this.update = this.buildUpdateVehicleUseCase();
    }

    buildCreateVehicleUseCase(): CreateVehicleUseCase {
        return new CreateVehicleUseCase(this.vehicleRepository);
    }

    buildDeleteVehicleUseCase(): DeleteVehicleUseCase {
        return new DeleteVehicleUseCase(this.vehicleRepository);
    }

    buildGetAllVehiclesUseCase(): GetAllVehiclesUseCase {
        return new GetAllVehiclesUseCase(this.vehicleRepository);
    }

    buildGetVehicleByIdUseCase(): GetVehicleByIdUseCase {
        return new GetVehicleByIdUseCase(this.vehicleRepository);
    }

    buildGetVehicleByLicensePlateUseCase(): GetVehicleByLicensePlateUseCase {
        return new GetVehicleByLicensePlateUseCase(this.vehicleRepository);
    }

    buildUpdateVehicleUseCase(): UpdateVehicleUseCase {
        return new UpdateVehicleUseCase(this.vehicleRepository);
    }
}
