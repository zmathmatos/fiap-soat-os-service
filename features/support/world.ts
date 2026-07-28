import { setWorldConstructor, World } from "@cucumber/cucumber";
import { InMemoryServiceOrderRepository } from "../../tests/fakes/InMemoryServiceOrderRepository";
import { CreateServiceOrderUseCase } from "../../src/application/use-cases/service-order/methods/CreateServiceOrderUseCase";
import { UpdateServiceOrderUseCase } from "../../src/application/use-cases/service-order/methods/UpdateServiceOrderUseCase";
import { ServiceOrder } from "../../src/domain/entities/ServiceOrder";

/**
 * Shared state for the OS lifecycle BDD scenarios. Drives the real
 * Create/Update use cases against an in-memory repository so the saga's
 * status machine is exercised end to end without infrastructure.
 */
export class OsWorld extends World {
  readonly repo = new InMemoryServiceOrderRepository();
  readonly createServiceOrder = new CreateServiceOrderUseCase(this.repo);
  readonly updateServiceOrder = new UpdateServiceOrderUseCase(this.repo);

  readonly userId = "user-1";
  readonly vehicleId = "vehicle-1";
  currentOrder: ServiceOrder | null = null;
}

setWorldConstructor(OsWorld);
