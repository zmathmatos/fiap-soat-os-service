import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import { OsWorld } from "../support/world";
import { ServiceOrderStatus } from "../../src/domain/entities/ServiceOrder";

async function moveTo(world: OsWorld, status: ServiceOrderStatus) {
  assert.ok(world.currentOrder, "Nenhuma ordem de serviço aberta");
  world.currentOrder = await world.updateServiceOrder.execute(
    world.currentOrder.id,
    world.userId,
    world.vehicleId,
    undefined,
    undefined,
    status,
  );
}

Given("que um cliente com veículo abre uma ordem de serviço", async function (this: OsWorld) {
  this.currentOrder = await this.createServiceOrder.execute(this.userId, this.vehicleId);
});

When("o orçamento é enviado para aprovação", async function (this: OsWorld) {
  await moveTo(this, ServiceOrderStatus.awaitingApproval);
});

When("o pagamento é aprovado", async function (this: OsWorld) {
  await moveTo(this, ServiceOrderStatus.inExecution);
});

When("a execução do reparo é finalizada", async function (this: OsWorld) {
  await moveTo(this, ServiceOrderStatus.completed);
});

When("o pagamento é recusado", async function (this: OsWorld) {
  await moveTo(this, ServiceOrderStatus.completed);
});

When("o orçamento é recusado pelo cliente", async function (this: OsWorld) {
  await moveTo(this, ServiceOrderStatus.completed);
});

Then("o status da ordem é {string}", function (this: OsWorld, status: string) {
  assert.ok(this.currentOrder, "Nenhuma ordem de serviço aberta");
  assert.strictEqual(this.currentOrder.status, status);
});
