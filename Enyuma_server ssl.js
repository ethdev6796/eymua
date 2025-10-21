import express from "express";
import axios from "axios";
import cors from "cors";
import https from 'https';
import fs  from 'fs';
import path from 'path'; // Add this import
import { fileURLToPath } from "url"; // ✅ ESM-friendly __dirname

// Create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const privateKey = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
const config = {
	userInfoUrl: "http://localhost:8080/realms/ra/protocol/openid-connect/token/introspect",
	clientId: "ra",
	clientSecret: "A77AXUy02BkNHpfFfgQ9CG4oUn5WK6ZA",
};

app.use(
	cors({
		origin: "*",
	}),
);

async function getuserdata(accessToken) {
	try {
		const response = await axios.post(
			config.userInfoUrl,
			new URLSearchParams({
				token: accessToken,
				client_id: config.clientId,
				client_secret: config.clientSecret,
			}),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		return response.data;
	} catch (err) {
		console.error("Error fetching user data:", err.message);
		throw new Error(`wow ${err.message}`);
	}
}



app.post("/getUserInfo", async (req, res) => {
	
	const { accessToken } = req.body;
	if (!accessToken) {
		return res.status(400).json({ error: "Access token is required" });
	}

	try {
		const response = await getuserdata(accessToken);

		const userInfo = {
			sid: response.sid,
			email: response.email,
			username: response.username,
			name: response.name,
		};

		res.json(userInfo);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post("/getUserRole", async (req, res) => {
	console.log("Request received at /getUserInfo");
	const { accessToken } = req.body;
	if (!accessToken) {
		return res.status(400).json({ error: "Access token is required" });
	}

	try {
		const response = await getuserdata(accessToken);

		const userRoles = response.resource_access?.ra?.roles || [];

		res.json(userRoles);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});


 

const PORT = 5678;
httpsServer.listen(PORT,"172.20.139.130" ,() => {
	console.log(`Server is running on https://172.20.139.130:${PORT}`);
});
