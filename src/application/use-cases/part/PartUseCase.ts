import { CreatePartUseCase } from "./methods/CreatePartUseCase";
import { DeletePartUseCase } from "./methods/DeletePartUseCase";
import { GetAllPartsUseCase } from "./methods/GetAllPartsUseCase";
import { GetPartByIdUseCase } from "./methods/GetPartByIdUseCase";
import { GetPartByPartNumberUseCase } from "./methods/GetPartByPartNumberUseCase";
import { UpdatePartUseCase } from "./methods/UpdatePartUseCase";
import type { IPartRepository } from "../../../domain/repositories/IPartRepository";

export class PartUseCase {
    readonly create: CreatePartUseCase;
    readonly delete: DeletePartUseCase;
    readonly getAll: GetAllPartsUseCase;
    readonly getById: GetPartByIdUseCase;
    readonly getByPartNumber: GetPartByPartNumberUseCase;
    readonly update: UpdatePartUseCase;

    private partRepository: IPartRepository;

    constructor(partRepository: IPartRepository) {
        this.partRepository = partRepository;

        this.create = this.buildCreatePartUseCase();
        this.delete = this.buildDeletePartUseCase();
        this.getAll = this.buildGetAllPartsUseCase();
        this.getById = this.buildGetPartByIdUseCase();
        this.getByPartNumber = this.buildGetPartByPartNumberUseCase();
        this.update = this.buildUpdatePartUseCase();
    }

    buildCreatePartUseCase(): CreatePartUseCase {
        return new CreatePartUseCase(this.partRepository);
    }

    buildDeletePartUseCase(): DeletePartUseCase {
        return new DeletePartUseCase(this.partRepository);
    }

    buildGetAllPartsUseCase(): GetAllPartsUseCase {
        return new GetAllPartsUseCase(this.partRepository);
    }

    buildGetPartByIdUseCase(): GetPartByIdUseCase {
        return new GetPartByIdUseCase(this.partRepository);
    }

    buildGetPartByPartNumberUseCase(): GetPartByPartNumberUseCase {
        return new GetPartByPartNumberUseCase(this.partRepository);
    }

    buildUpdatePartUseCase(): UpdatePartUseCase {
        return new UpdatePartUseCase(this.partRepository);
    }
}
