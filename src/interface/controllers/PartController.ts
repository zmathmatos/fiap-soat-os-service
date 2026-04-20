import { PartUseCase } from "../../application/use-cases/part/PartUseCase";
import { Part } from "../../domain/entities/Part";
import { IPartRepository } from "../../domain/repositories/IPartRepository";

export class PartController {
  private partUseCase: PartUseCase;

  constructor(partRepository: IPartRepository) {
    this.partUseCase = new PartUseCase(partRepository);
  }

  async create({
    name,
    partNumber,
    brand,
    price,
    stockQuantity,
  }: Readonly<{
    name: string;
    partNumber: string;
    brand: string;
    price: number;
    stockQuantity: number;
  }>): Promise<Part> {
    const part = await this.partUseCase.create.execute(
      name,
      partNumber,
      brand,
      price,
      stockQuantity,
    );
    return part;
  }

  async getById(id: string): Promise<Part | null> {
    const part = await this.partUseCase.getById.execute(id);

    return part;
  }

  async getAll(): Promise<Part[]> {
    return this.partUseCase.getAll.execute();
  }

  async getPartByPartNumber(partNumber: string): Promise<Part | null> {
    const part = await this.partUseCase.getByPartNumber.execute(
      partNumber as string,
    );

    return part;
  }

  async update({
    id,
    name,
    partNumber,
    brand,
    price,
    stockQuantity,
  }: Readonly<{
    id: string;
    name: string;
    partNumber: string;
    brand: string;
    price: number;
    stockQuantity: number;
  }>): Promise<Part | null> {
    const part = await this.partUseCase.update.execute(id, {
      name,
      partNumber,
      brand,
      price,
      stockQuantity,
    });

    return part;
  }

  async delete(id: string): Promise<boolean> {
    return this.partUseCase.delete.execute(id);
  }
}
