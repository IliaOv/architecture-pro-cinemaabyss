import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "events-service",
  brokers: (process.env.KAFKA_BROKERS || "kafka:9092")
  .split(",")
  .map(b => b.trim()),
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "events-service-group" });

export async function initKafka() {
  await producer.connect();
  await consumer.connect();

  // Подписываемся на три топика
  await consumer.subscribe({ topic: "movie-events", fromBeginning: true });
  await consumer.subscribe({ topic: "user-events", fromBeginning: true });
  await consumer.subscribe({ topic: "payment-events", fromBeginning: true });

  console.log("Kafka consumer subscribed");

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `[Kafka] Received message | topic=${topic} | partition=${partition} | offset=${message.offset}`
      );
      console.log(`Payload: ${message.value.toString()}`);
    },
  });
}
