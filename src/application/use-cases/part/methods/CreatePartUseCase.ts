import { Part } from "../../../../domain/entities/Part";
import type { IPartRepository } from "../../../../domain/repositories/IPartRepository";

export class CreatePartUseCase {
  private partRepository: IPartRepository;

  constructor(partRepository: IPartRepository) {
    this.partRepository = partRepository;
  }

  async execute(
    name: string,
    partNumber: string,
    brand: string,
    price: number,
    stockQuantity: number
  ): Promise<Part> {
    if (!name || !partNumber || !brand || price === undefined || stockQuantity === undefined) {
      throw new Error("All fields are required");
    }

    if (price < 0) {
      throw new Error("Price cannot be negative");
    }

    if (stockQuantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    const existingPart = await this.partRepository.findByPartNumber(partNumber);

    if (existingPart) {
      throw new Error("Part with this part number already exists");
    }

    const partData = Part.create(name, partNumber, brand, price, stockQuantity);
    return await this.partRepository.create(partData);
  }
}
