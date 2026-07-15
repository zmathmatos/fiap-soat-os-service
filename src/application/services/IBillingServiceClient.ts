export interface CreateQuotationInput {
  serviceOrderId: string;
  serviceOrderNumber: number;
  customerId: string;
  customerEmail: string;
  description: string;
  amount: number;
}

export interface IBillingServiceClient {
  createQuotation(input: CreateQuotationInput): Promise<void>;
}
