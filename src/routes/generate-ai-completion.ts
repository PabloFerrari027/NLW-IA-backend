import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";
import { OpenAIStream, streamToResponse } from "ai";

export async function generateIaCompletionRoute(app: FastifyInstance) {
  app.post("/ai/complete", async (req, rep) => {
    const bodySchema = z.object({
      videoId: z.string(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { prompt, temperature, videoId } = bodySchema.parse(req.body);

    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId,
      },
    });

    if (!video.transcription) {
      return rep
        .status(400)
        .send({ error: "Video transcription was not generated yet." });
    }

    const promptMessage = prompt.replace(
      "{transcription}",
      video.transcription
    );

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature,
      messages: [
        {
          role: "user",
          content: promptMessage,
        },
      ],
      stream: true,
    });

    const stream = OpenAIStream(response);
    streamToResponse(stream, rep.raw, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  });
}
