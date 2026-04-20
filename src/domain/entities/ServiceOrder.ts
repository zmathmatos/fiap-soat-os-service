import { Part } from "./Part";
import { Service } from "./Service";
import { User } from "./User";
import { Vehicle } from "./Vehicle";

export enum ServiceOrderStatus {
  received = "Recebido",
  inDiagnostic = "Em diagnóstico",
  awaitingApproval = "Aguardando aprovação",
  inExecution = "Em execução",
  completed = "Finalizado",
  delivered = "Entregue"
}

interface ServiceOrderParams {
  id: string;
  user: User;
  vehicle: Vehicle;
  parts: Part[];
  services: Service[];
  serviceOrderNumber: number;
  status: ServiceOrderStatus;
  startedServiceAt?: Date;
  endedServiceAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceOrder {
  public readonly id: ServiceOrderParams["id"];
  public readonly user: ServiceOrderParams["user"];
  public readonly vehicle: ServiceOrderParams["vehicle"];
  public readonly parts: ServiceOrderParams["parts"];
  public readonly services: ServiceOrderParams["services"];
  public readonly serviceOrderNumber: ServiceOrderParams["serviceOrderNumber"];
  public readonly status: ServiceOrderParams["status"];
  public readonly startedServiceAt?: ServiceOrderParams["startedServiceAt"];
  public readonly endedServiceAt?: ServiceOrderParams["endedServiceAt"];
  public readonly createdAt: ServiceOrderParams["createdAt"];
  public readonly updatedAt: ServiceOrderParams["updatedAt"];

  constructor({
    id,
    user,
    vehicle,
    parts,
    services,
    serviceOrderNumber,
    status,
    startedServiceAt,
    endedServiceAt,
    createdAt,
    updatedAt
  }: ServiceOrderParams) {
    this.id = id;
    this.user = user;
    this.vehicle = vehicle;
    this.parts = parts;
    this.services = services;
    this.serviceOrderNumber = serviceOrderNumber;
    this.status = status;
    this.startedServiceAt = startedServiceAt;
    this.endedServiceAt = endedServiceAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(): Omit<ServiceOrder, "id" | "serviceOrderNumber" | "user" | "vehicle" | "parts" | "services" | "startedServiceAt" | "endedServiceAt" | "createdAt" | "updatedAt"> {
    return {
      status: ServiceOrderStatus.received
    };
  }
}
