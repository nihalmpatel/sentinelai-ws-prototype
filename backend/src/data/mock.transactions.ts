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

const now = Date.now();

export const mockTransactions: MockTransaction[] = [
	// ── James Sullivan (id 1) — routine business expenses ──
	{
		id: 1,
		userId: 1,
		amount: 1247.5,
		currency: "USD",
		merchant: "AWS Cloud Services",
		location: "Online",
		category: "Technology",
		timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
	},
	{
		id: 2,
		userId: 1,
		amount: 325.0,
		currency: "USD",
		merchant: "Office Depot",
		location: "New York, NY",
		category: "Office Supplies",
		timestamp: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
	},
	{
		id: 3,
		userId: 1,
		amount: 89.99,
		currency: "USD",
		merchant: "Uber Business",
		location: "New York, NY",
		category: "Transportation",
		timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
	},

	// ── Elena Vostrikova (id 2) — cross-border transfers, elevated risk ──
	{
		id: 4,
		userId: 2,
		amount: 5500.0,
		currency: "EUR",
		merchant: "Deutsche Bank Wire",
		location: "Frankfurt, DE",
		category: "Wire Transfer",
		timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
	},
	{
		id: 5,
		userId: 2,
		amount: 3200.0,
		currency: "EUR",
		merchant: "Greenbridge GmbH",
		location: "Berlin, DE",
		category: "Business Payment",
		timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
	},
	{
		id: 6,
		userId: 2,
		amount: 18750.0,
		currency: "USD",
		merchant: "SWIFT Intl Transfer",
		location: "Zurich, CH",
		category: "International Wire",
		timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
	},

	// ── Marcus Obi (id 3) — structuring pattern (just below $10K) ──
	{
		id: 7,
		userId: 3,
		amount: 9800.0,
		currency: "USD",
		merchant: "Cash Deposit ATM",
		location: "Lagos, NG",
		category: "Cash Deposit",
		timestamp: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
	},
	{
		id: 8,
		userId: 3,
		amount: 9700.0,
		currency: "USD",
		merchant: "Cash Deposit ATM",
		location: "Lagos, NG",
		category: "Cash Deposit",
		timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
	},
	{
		id: 9,
		userId: 3,
		amount: 9600.0,
		currency: "USD",
		merchant: "Cash Deposit Branch",
		location: "Abuja, NG",
		category: "Cash Deposit",
		timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
	},
	{
		id: 10,
		userId: 3,
		amount: 9850.0,
		currency: "USD",
		merchant: "Cash Deposit ATM",
		location: "Lagos, NG",
		category: "Cash Deposit",
		timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
	},

	// ── Priya Chakrabarti (id 4) — large rapid withdrawals after deposit (geo-velocity) ──
	{
		id: 11,
		userId: 4,
		amount: 45000.0,
		currency: "USD",
		merchant: "Wire Deposit Inbound",
		location: "Mumbai, IN",
		category: "Wire Transfer",
		timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
	},
	{
		id: 12,
		userId: 4,
		amount: 15000.0,
		currency: "USD",
		merchant: "Wealth Mgmt Withdrawal",
		location: "Singapore, SG",
		category: "Withdrawal",
		timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
	},
	{
		id: 13,
		userId: 4,
		amount: 14500.0,
		currency: "GBP",
		merchant: "Barclays Transfer",
		location: "London, GB",
		category: "International Wire",
		timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
	},

	// ── Carlos Medina (id 5) — small regular purchases, low risk ──
	{
		id: 14,
		userId: 5,
		amount: 42.5,
		currency: "MXN",
		merchant: "OXXO Convenience",
		location: "Mexico City, MX",
		category: "Retail",
		timestamp: new Date(now - 1000 * 60 * 60 * 96).toISOString(),
	},
	{
		id: 15,
		userId: 5,
		amount: 156.0,
		currency: "MXN",
		merchant: "Walmart Supercenter",
		location: "Mexico City, MX",
		category: "Retail",
		timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
	},
	{
		id: 16,
		userId: 5,
		amount: 89.0,
		currency: "USD",
		merchant: "Netflix",
		location: "Online",
		category: "Subscription",
		timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
	},

	// ── Sophie Laurent (id 6) — luxury purchases, new account ──
	{
		id: 17,
		userId: 6,
		amount: 4200.0,
		currency: "EUR",
		merchant: "Louis Vuitton",
		location: "Paris, FR",
		category: "Luxury Retail",
		timestamp: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
	},
	{
		id: 18,
		userId: 6,
		amount: 8500.0,
		currency: "EUR",
		merchant: "Cartier Jewelers",
		location: "Paris, FR",
		category: "Luxury Retail",
		timestamp: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
	},

	// ── David Kim (id 7) — high-value portfolio movements ──
	{
		id: 19,
		userId: 7,
		amount: 125000.0,
		currency: "USD",
		merchant: "Goldman Sachs Wire",
		location: "Seoul, KR",
		category: "Investment Transfer",
		timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
	},
	{
		id: 20,
		userId: 7,
		amount: 75000.0,
		currency: "USD",
		merchant: "Crypto Exchange Deposit",
		location: "Online",
		category: "Cryptocurrency",
		timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
	},
];
