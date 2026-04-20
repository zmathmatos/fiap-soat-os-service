import { Part } from "../../../../domain/entities/Part";
import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class GetAllPartsUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(): Promise<Part[]> {
    return await this.partRepository.findAll();
  }
}
