import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const create = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock("../../../../../src/infrastructure/database/sequelize/init", () => ({
  sequelize: { define: jest.fn(), models: {} },
}));

jest.mock("sequelize", () => {
  const actual = jest.requireActual<typeof import("sequelize")>("sequelize");
  class FakeModel {
    static init = jest.fn();
    static create = create;
  }
  return { ...actual, Model: FakeModel };
});

import { insertOutboxEvent } from "../../../../../src/infrastructure/database/sequelize/models/OutboxEventModel";

describe("insertOutboxEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("writes the event inside the caller's transaction so it commits with the order", async () => {
    const transaction = { id: "tx-1" } as never;
    create.mockResolvedValue(undefined);

    await insertOutboxEvent("quotation.requested", { serviceOrderId: "so-1" }, transaction);

    expect(create).toHaveBeenCalledWith(
      { eventType: "quotation.requested", payload: { serviceOrderId: "so-1" } },
      { transaction },
    );
  });

  it("propagates the failure so the surrounding transaction rolls back", async () => {
    create.mockRejectedValue(new Error("unique violation"));

    await expect(
      insertOutboxEvent("quotation.requested", { serviceOrderId: "so-1" }, {} as never),
    ).rejects.toThrow("unique violation");
  });
});
