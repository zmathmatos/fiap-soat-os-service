import { ServiceOrder } from "./ServiceOrder";

interface UserParams {
  id: string;
  serviceOrders?: ServiceOrder[];
  name: string;
  document: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: UserParams["id"];
  public readonly name: UserParams["name"];
  public readonly document: UserParams["document"];
  public readonly email: UserParams["email"];
  public readonly password: UserParams["password"];
  public readonly role: UserParams["role"];
  public readonly createdAt: UserParams["createdAt"];
  public readonly updatedAt: UserParams["updatedAt"];
  public readonly serviceOrders?: UserParams["serviceOrders"];

  constructor({
    id,
    name,
    document,
    email,
    password,
    role,
    createdAt,
    updatedAt,
    serviceOrders,
  }: UserParams) {
    this.id = id;
    this.name = name;
    this.document = document;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.serviceOrders = serviceOrders;
  }

  static create(
    name: UserParams["name"],
    document: UserParams["document"],
    email: UserParams["email"],
    password: UserParams["password"],
  ): Omit<User, "id" | "serviceOrders" | "createdAt" | "updatedAt"> {
    return {
      name,
      document,
      email,
      password,
      role: "customer",
    };
  }
}
