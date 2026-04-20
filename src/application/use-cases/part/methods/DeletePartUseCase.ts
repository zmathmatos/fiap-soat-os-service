import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class DeletePartUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(id: string): Promise<boolean> {
    const part = await this.partRepository.findById(id);

    if (!part) {
      throw new Error("Part not found");
    }

    return await this.partRepository.delete(id);
  }
}
