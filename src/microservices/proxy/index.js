import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

const MONOLITH_URL = process.env.MONOLITH_URL;
const MOVIES_SERVICE_URL = process.env.MOVIES_SERVICE_URL;
const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;

const GRADUAL_MIGRATION = process.env.GRADUAL_MIGRATION === "true";
const MOVIES_MIGRATION_PERCENT = parseInt(process.env.MOVIES_MIGRATION_PERCENT || "0", 10);

// --------------------------
// Health Check
// --------------------------
app.get("/health", (req, res) => {
    res.status(200).json({ status: "proxy-ok" });
});

// --------------------------
// Helper: forward request
// --------------------------
async function forwardRequest(targetUrl, req, res) {
    try {
        const axiosConfig = {
            method: req.method,
            url: targetUrl + req.url,
            headers: req.headers,
            data: req.body
        };

        const response = await axios(axiosConfig);
        res.status(response.status).json(response.data);
    } catch (err) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            console.error(err);
            res.status(500).json({ error: "Proxy internal error" });
        }
    }
}

// --------------------------
// Movies routing with Strangler Fig
// --------------------------
// GET /api/movies, GET /api/movies?id=...
// POST /api/movies
app.all("/api/movies*", async (req, res) => {
    if (GRADUAL_MIGRATION) {
        const rnd = Math.random() * 100;
        const useNewService = rnd < MOVIES_MIGRATION_PERCENT;

        if (useNewService) {
            return forwardRequest(MOVIES_SERVICE_URL, req, res);
        }
    }

    return forwardRequest(MONOLITH_URL, req, res);
});

// --------------------------
// Users (always monolith)
// --------------------------
app.all("/api/users*", async (req, res) => {
    return forwardRequest(MONOLITH_URL, req, res);
});

// --------------------------
// Payments
// --------------------------
app.all("/api/payments*", async (req, res) => {
    return forwardRequest(MONOLITH_URL, req, res);
});

// --------------------------
// Subscriptions
// --------------------------
app.all("/api/subscriptions*", async (req, res) => {
    return forwardRequest(MONOLITH_URL, req, res);
});

// --------------------------
// Events → always new service
// --------------------------
app.all("/api/events*", async (req, res) => {
    return forwardRequest(EVENTS_SERVICE_URL, req, res);
});

// --------------------------
// Start server
// --------------------------
app.listen(PORT, () => {
    console.log(`Proxy service running on port ${PORT}`);
});
