import sequelize from "../config";
import ServiceOrderModel, {
  ServiceOrderModelPart,
} from "../models/ServiceOrderModel";
import Logger from "./Logger";
import { BillingServiceClient } from "../../../http/BillingServiceClient";

class Utils {
  static async generateQuotation(serviceOrderId: string): Promise<void> {
    Logger.log("Gerando orçamento...");

    const serviceOrder = await ServiceOrderModel.findByPk(serviceOrderId, {
      include: [
        { association: "user", attributes: { exclude: ["password"] } },
        "services",
        "parts",
      ],
    });

    if (!serviceOrder) {
      throw new Error(`Service order ${serviceOrderId} not found`);
    }

    const orderData = serviceOrder.toJSON() as {
      id: string;
      serviceOrderNumber: number;
      user: { id: string; email: string };
      parts: Array<{ name: string; price: number; ServiceOrderModelPart: { quantity: number } }>;
      services: Array<{ name: string; price: number }>;
    };

    const parts = orderData.parts ?? [];
    const services = orderData.services ?? [];

    const partsAmount = parts.reduce(
      (sum, p) => sum + Number(p.price) * (p.ServiceOrderModelPart?.quantity ?? 1),
      0,
    );
    const servicesAmount = services.reduce((sum, s) => sum + Number(s.price), 0);
    const amount = partsAmount + servicesAmount;

    const descriptionParts: string[] = [];
    if (services.length > 0) {
      descriptionParts.push(`Serviços: ${services.map((s) => s.name).join(", ")}`);
    }
    if (parts.length > 0) {
      descriptionParts.push(
        `Peças: ${parts.map((p) => `${p.name} (x${p.ServiceOrderModelPart?.quantity ?? 1})`).join(", ")}`,
      );
    }
    const description = descriptionParts.join("; ") || "Serviço de manutenção";

    const billingClient = new BillingServiceClient();
    await billingClient.createQuotation({
      serviceOrderId: orderData.id,
      serviceOrderNumber: orderData.serviceOrderNumber,
      customerId: orderData.user.id,
      customerEmail: orderData.user.email,
      description,
      amount,
    });

    Logger.log(
      `Orçamento enviado para o billing service, OS ${orderData.serviceOrderNumber}.`,
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
