import { Part } from "../../../../domain/entities/Part";
import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class GetPartByPartNumberUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(partNumber: string): Promise<Part | null> {
    return await this.partRepository.findByPartNumber(partNumber);
  }
}
