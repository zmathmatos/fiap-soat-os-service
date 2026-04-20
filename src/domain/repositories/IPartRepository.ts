import { Part } from "../entities/Part";

export interface IPartRepository {
  create(part: Omit<Part, "id" | "createdAt" | "updatedAt" | "serviceQuantity">): Promise<Part>;
  findById(id: string): Promise<Part | null>;
  findAll(): Promise<Part[]>;
  findByPartNumber(partNumber: string): Promise<Part | null>;
  update(id: string, part: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>): Promise<Part | null>;
  delete(id: string): Promise<boolean>;
}
