interface ServiceParams {
  id: string;
  name: string;
  serviceCode: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service {
  public readonly id: ServiceParams["id"];
  public readonly name: ServiceParams["name"];
  public readonly serviceCode: ServiceParams["serviceCode"];
  public readonly price: ServiceParams["price"];
  public readonly createdAt: ServiceParams["createdAt"];
  public readonly updatedAt: ServiceParams["updatedAt"];

  constructor({
    id,
    name,
    serviceCode,
    price,
    createdAt,
    updatedAt,
  }: ServiceParams) {
    this.id = id;
    this.name = name;
    this.serviceCode = serviceCode;
    this.price = price;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    serviceCode: string,
    price: number
  ): Omit<Service, "id" | "createdAt" | "updatedAt"> {
    return {
      name,
      serviceCode,
      price,
    };
  }
}
