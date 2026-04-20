import { Part } from "../../domain/entities/Part";

export class PartPresenter {
  static toResponse(part: Part) {
    return {
      id: part.id,
      name: part.name,
      partNumber: part.partNumber,
      brand: part.brand,
      price: part.price,
      stockQuantity: part.stockQuantity,
    };
  }

  static toListResponse(parts: Part[]) {
    return parts.map(PartPresenter.toResponse);
  }
}
