export interface MockTransaction {
	id: number;
	userId: number;
	amount: number;
	currency: string;
	timestamp: string;
}

const now = Date.now();

export const mockTransactions: MockTransaction[] = [
	{id: 1, userId: 1, amount: 1200, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString()},
	{id: 2, userId: 1, amount: 250, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 36).toISOString()},
	{id: 3, userId: 1, amount: 80, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString()},
	{id: 4, userId: 2, amount: 5500, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString()},
	{id: 5, userId: 2, amount: 300, currency: "EUR", timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString()},
	{id: 6, userId: 3, amount: 9800, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 6).toISOString()},
	{id: 7, userId: 3, amount: 9700, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString()},
	{id: 8, userId: 3, amount: 9600, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString()},
	{id: 9, userId: 4, amount: 15000, currency: "USD", timestamp: new Date(now - 1000 * 60 * 30).toISOString()},
	{id: 10, userId: 4, amount: 14500, currency: "USD", timestamp: new Date(now - 1000 * 60 * 10).toISOString()},
	{id: 11, userId: 5, amount: 45, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 96).toISOString()},
	{id: 12, userId: 5, amount: 60, currency: "USD", timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString()},
];
