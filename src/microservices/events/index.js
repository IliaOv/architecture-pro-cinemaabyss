import express from "express";
import { producer, initKafka } from "./kafka.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8082;

function createEvent(type, payload) {
  return {
    id: `${type}-${Date.now()}`,
    type,
    timestamp: new Date().toISOString(),
    payload,
  };
}

async function sendEvent(topic, event) {
  const result = await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }],
  });

  const record = result[0];
  return {
    partition: record.partition,
    offset: record.baseOffset,
  };
}

// ------------------------------
// Health Check
// ------------------------------
app.get("/api/events/health", (req, res) => {
  res.status(200).json({ status: true });
});

// ------------------------------
// Movie event
// ------------------------------
app.post("/api/events/movie", async (req, res) => {
  try {
    const event = createEvent("movie", req.body);
    const meta = await sendEvent("movie-events", event);

    res.status(201).json({
      status: "success",
      partition: meta.partition,
      offset: parseInt(meta.offset, 10),
      event,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to process movie event" });
  }
});

// ------------------------------
// User event
// ------------------------------
app.post("/api/events/user", async (req, res) => {
  try {
    const event = createEvent("user", req.body);
    const meta = await sendEvent("user-events", event);

    res.status(201).json({
      status: "success",
      partition: meta.partition,
      offset: parseInt(meta.offset, 10),
      event,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to process user event" });
  }
});

// ------------------------------
// Payment event
// ------------------------------
app.post("/api/events/payment", async (req, res) => {
  try {
    const event = createEvent("payment", req.body);
    const meta = await sendEvent("payment-events", event);

    res.status(201).json({
      status: "success",
      partition: meta.partition,
      offset: parseInt(meta.offset, 10),
      event,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to process payment event" });
  }
});

// Start
app.listen(PORT, async () => {
  console.log(`Events service running on port ${PORT}`);
  await initKafka();
});
