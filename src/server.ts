import "dotenv/config";
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createTranscription } from "./routes/create-transcription";
import { generateIaCompletionRoute } from "./routes/generate-ai-completion";

export const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(getAllPromptsRoute);

app.register(uploadVideoRoute);

app.register(createTranscription);

app.register(generateIaCompletionRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server running 🔥");
  });
