import express from "express";
import axios from "axios";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

// Create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const config = {
	userInfoUrl: "http://172.27.3.30:8080/realms/RA/protocol/openid-connect/token/introspect",
	clientId: "ra",
	clientSecret: "m1aw1RGXfWhwveJ6FD3P0WAXcQMrnVop",
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
	const { accessToken } = req.body;
		console.log("req.body", req.body);
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
app.listen(PORT, () => {
	console.log(`Server is running on http://172.20.139.130:${PORT}`);
});
