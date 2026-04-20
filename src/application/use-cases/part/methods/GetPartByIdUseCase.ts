import { Part } from "../../../../domain/entities/Part";
import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class GetPartByIdUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(id: string): Promise<Part | null> {
    return await this.partRepository.findById(id);
  }
}
