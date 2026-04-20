import sequelize from "../config";
import ServiceOrderModel, {
  ServiceOrderModelPart,
} from "../models/ServiceOrderModel";
import Logger from "./Logger";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class Utils {
  static async generateQuotation(serviceOrderNumber: number) {
    Logger.log("Gerando orçamento...");
    await sleep(2000); // Simula o tempo para gerar o orçamento
    Logger.log(
      `Orçamento enviado, OS ${serviceOrderNumber} aguardando aprovação.`,
    );
  }

  static async updateInventory(serviceOrder: ServiceOrderModel) {
    const parts = serviceOrder.parts ?? [];
    for (const part of parts) {
      const transaction = await sequelize.transaction();
      try {
        const serviceQuantity =
          part.toJSON()?.ServiceOrderModelPart?.serviceQuantiy ?? 0;
        if (serviceQuantity) {
          await part.part.decrement("stockQuantity", {
            by: serviceQuantity,
            transaction,
          });
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }
}

export default Utils;
