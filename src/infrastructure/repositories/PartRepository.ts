import { Part } from "../../domain/entities/Part";
import { IPartRepository } from "../../domain/repositories/IPartRepository";
import { PartModel } from "../database/sequelize/models/PartModel";

export class PartRepository implements IPartRepository {
  private convertToEntity(partModel: PartModel): Part {
    return new Part({
      ...partModel.dataValues,
      price: Number.parseFloat(partModel.dataValues.price as any),
    });
  }

  async create(
    part: Omit<Part, "id" | "createdAt" | "updatedAt" | "service" | "serviceQuantity">
  ): Promise<Part> {
    const createdPart = await PartModel.create({
      name: part.name,
      partNumber: part.partNumber,
      brand: part.brand,
      price: part.price,
      stockQuantity: part.stockQuantity,
    });

    return this.convertToEntity(createdPart);
  }

  async findById(id: string): Promise<Part | null> {
    const part = await PartModel.findByPk(id);

    if (!part) {
      return null;
    }

    return this.convertToEntity(part);
  }

  async findAll(): Promise<Part[]> {
    const parts = await PartModel.findAll();

    return parts.map((part) => this.convertToEntity(part));
  }

  async findByPartNumber(partNumber: string): Promise<Part | null> {
    const part = await PartModel.findOne({
      where: { partNumber }
    });

    if (!part) {
      return null;
    }

    return this.convertToEntity(part);
  }

  async update(
    id: string,
    partData: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
  ): Promise<Part | null> {
    const part = await PartModel.findByPk(id);

    if (!part) {
      return null;
    }

    await part.update(partData);

    return this.convertToEntity(part);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await PartModel.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}
