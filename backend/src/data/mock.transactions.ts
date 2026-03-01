export interface MockTransaction {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  timestamp: string;
}

export const mockTransactions: MockTransaction[] = [
  {
    id: 1,
    userId: 1,
    amount: 1200,
    currency: "USD",
    timestamp: new Date().toISOString()
  }
];

