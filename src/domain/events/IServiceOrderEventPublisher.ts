export interface OrderReceivedEvent {
  serviceOrderId: string;
  serviceOrderNumber: number;
}

export interface IServiceOrderEventPublisher {
  publishOrderReceived(event: OrderReceivedEvent): Promise<void>;
}
