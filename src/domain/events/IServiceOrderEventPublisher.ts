export interface OrderReceivedEvent {
  serviceOrderId: string;
  serviceOrderNumber: number;
}

export interface DiagnosticFinishedEvent {
  serviceOrderId: string;
  parts: { id: string; name: string; quantity: number; price: number }[];
  services: { id: string; name: string; price: number }[];
}

export interface IServiceOrderEventPublisher {
  publishOrderReceived(event: OrderReceivedEvent): Promise<void>;
  publishDiagnosticFinished(event: DiagnosticFinishedEvent): Promise<void>;
}
