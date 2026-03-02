export interface MockUser {
	id: number;
	name: string;
	role: "analyst" | "supervisor";
}

export const mockUsers: MockUser[] = [
	{id: 1, name: "Analyst One", role: "analyst"},
	{id: 2, name: "Supervisor One", role: "supervisor"},
	{id: 3, name: "Analyst Two", role: "analyst"},
	{id: 4, name: "Analyst Three", role: "analyst"},
	{id: 5, name: "Supervisor Two", role: "supervisor"},
];
