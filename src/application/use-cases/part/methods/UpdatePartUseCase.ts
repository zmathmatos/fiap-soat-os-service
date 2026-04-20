import { Part } from "../../../../domain/entities/Part";
import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class UpdatePartUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(
    id: string,
    partData: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
  ): Promise<Part | null> {
    const part = await this.partRepository.findById(id);

    if (!part) {
      return null;
    }

    if (partData.price !== undefined && partData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    if (partData.stockQuantity !== undefined && partData.stockQuantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    if (partData.partNumber) {
      const existingPart = await this.partRepository.findByPartNumber(
        partData.partNumber
      );
      if (existingPart && existingPart.id !== id) {
        throw new Error("Part with this part number already exists");
      }
    }

    return await this.partRepository.update(id, partData);
  }
}
