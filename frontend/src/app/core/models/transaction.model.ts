export interface MockTransaction {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  merchant: string;
  location: string;
  category: string;
  timestamp: string;
}
