import type { IBillingServiceClient, CreateQuotationInput } from '../../application/services/IBillingServiceClient';

export class BillingServiceClient implements IBillingServiceClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BILLING_SERVICE_URL ?? 'http://localhost:3001';
  }

  async createQuotation(input: CreateQuotationInput): Promise<void> {
    const response = await fetch(`${this.baseUrl}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Billing service returned ${response.status}: ${body}`);
    }
  }
}
