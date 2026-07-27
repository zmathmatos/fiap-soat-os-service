import { Op } from "sequelize";
import { OutboxEventModel } from "../database/sequelize/models/OutboxEventModel";
import Utils from "../database/sequelize/utils/Utils";
import Logger from "../database/sequelize/utils/Logger";

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;

export class OutboxPublisher {
  private timer: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this.scheduleNext();
    Logger.info("OutboxPublisher started", { event: "outbox.publisher.started" });
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNext(): void {
    this.timer = setTimeout(() => void this.poll(), POLL_INTERVAL_MS);
  }

  private async poll(): Promise<void> {
    try {
      const events = await OutboxEventModel.findAll({
        where: { publishedAt: { [Op.is]: null as unknown as null } },
        order: [["created_at", "ASC"]],
        limit: BATCH_SIZE,
      });

      for (const event of events) {
        await this.publishEvent(event);
      }
    } catch (error) {
      Logger.error("OutboxPublisher poll failed", {
        err: error,
        event: "outbox.publisher.pollFailed",
      });
    } finally {
      this.scheduleNext();
    }
  }

  private async publishEvent(event: OutboxEventModel): Promise<void> {
    try {
      if (event.eventType === "quotation.requested") {
        const serviceOrderId = (event.payload as { serviceOrderId?: string }).serviceOrderId;
        if (!serviceOrderId) {
          throw new Error(`Missing serviceOrderId in outbox event ${event.id}`);
        }
        await Utils.generateQuotation(serviceOrderId);
      } else {
        Logger.warn("OutboxPublisher: unknown event type, skipping", {
          eventType: event.eventType,
          eventId: event.id,
          event: "outbox.publisher.unknownEventType",
        });
      }

      await event.update({ publishedAt: new Date() });

      Logger.info("OutboxPublisher: event published", {
        eventType: event.eventType,
        eventId: event.id,
        event: "outbox.publisher.published",
      });
    } catch (error) {
      Logger.error("OutboxPublisher: failed to publish event, will retry next poll", {
        err: error,
        eventType: event.eventType,
        eventId: event.id,
        event: "outbox.publisher.publishFailed",
      });
    }
  }
}
