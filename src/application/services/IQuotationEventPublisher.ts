export interface QuotationRequestedPayload {
  serviceOrderId: string;
  serviceOrderNumber: number;
  customerId: string;
  customerEmail: string;
  description: string;
  amount: number;
}

export interface IQuotationEventPublisher {
  publishQuotationRequested(payload: QuotationRequestedPayload): Promise<void>;
}
