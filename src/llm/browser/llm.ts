import OpenAI from "openai";

export async function llmRequest(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string = "gpt-4o",
  openaiKey?: string
): Promise<String | null> {
  const client = new OpenAI({
    apiKey: openaiKey || process.env.OPENAI_API_KEY,
  });

  const response = await client.chat.completions.create({
    model: model,
    messages: messages,
    response_format: {
      type: "json_object",
    },
  });
  console.log("thought", response.choices[0].message.content);
  return response.choices[0].message.content || null;
}
