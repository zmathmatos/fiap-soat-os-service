interface PartParams {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  stockQuantity: number;
  serviceQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Part {
  public readonly id: PartParams["id"];
  public readonly name: PartParams["name"];
  public readonly partNumber: PartParams["partNumber"];
  public readonly brand: PartParams["brand"];
  public readonly price: PartParams["price"];
  public readonly stockQuantity: PartParams["stockQuantity"];
  public readonly serviceQuantity: PartParams["serviceQuantity"];
  public readonly createdAt: PartParams["createdAt"];
  public readonly updatedAt: PartParams["updatedAt"];

  constructor({
    id,
    name,
    partNumber,
    brand,
    price,
    stockQuantity,
    serviceQuantity,
    createdAt,
    updatedAt
  }: PartParams) {
    this.id = id;
    this.name = name;
    this.partNumber = partNumber;
    this.brand = brand;
    this.price = price;
    this.stockQuantity = stockQuantity;
    this.serviceQuantity = serviceQuantity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    partNumber: string,
    brand: string,
    price: number,
    stockQuantity: number
  ): Omit<Part, "id" | "createdAt" | "updatedAt" | "serviceQuantity"> {
    return {
      name,
      partNumber,
      brand,
      price,
      stockQuantity,
    };
  }
}
