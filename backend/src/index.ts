// Side-effect import: loads .env BEFORE any app modules are evaluated.
import "dotenv/config";
import {app} from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
	// Startup log kept minimal; real logging will live in audit module.
	console.log(`Sentinel backend listening on port ${port}`);
});
