import type { Report } from "@/lib/types";

export interface AiSummary {
  text: string;
  bullets: string[];
  model: string;
  generatedAt: string;
}

export class AiSummaryError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
    this.name = "AiSummaryError";
  }
}

const MOCK_FAILURE_RATE = Number(process.env.AI_MOCK_FAILURE_RATE ?? 0);
const MOCK_LATENCY_MS = Number(process.env.AI_MOCK_LATENCY_MS ?? 900);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mockSummary(report: Report): AiSummary {
  const sentences = report.body
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const lead = sentences[0] ?? report.summary;
  const bullets = sentences.slice(0, 4).map((s, idx) => {
    const trimmed = s.length > 160 ? `${s.slice(0, 157)}...` : s;
    return `${idx + 1}. ${trimmed}`;
  });

  const text = [
    `Headline: ${report.title}.`,
    lead,
    `Category: ${report.category}. Author: ${report.author}.`,
  ].join(" ");

  return {
    text,
    bullets,
    model: "mock-summarizer-v1",
    generatedAt: new Date().toISOString(),
  };
}

async function realOpenAiSummary(report: Report, apiKey: string): Promise<AiSummary> {
  const prompt = `Summarize the following internal report in 2-3 sentences for a busy executive, then provide 3 bullet point takeaways.\n\nTitle: ${report.title}\nAuthor: ${report.author}\nCategory: ${report.category}\n\n${report.body}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an executive assistant that produces tight, factual summaries. Respond as JSON: {\"text\": string, \"bullets\": string[]}",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new AiSummaryError(
      `OpenAI request failed: ${response.status} ${response.statusText}`,
      502,
    );
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    model?: string;
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new AiSummaryError("OpenAI returned an empty response", 502);
  }

  let parsed: { text?: string; bullets?: string[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AiSummaryError("OpenAI returned non-JSON content", 502);
  }

  if (!parsed.text || !Array.isArray(parsed.bullets)) {
    throw new AiSummaryError("OpenAI response missing required fields", 502);
  }

  return {
    text: parsed.text,
    bullets: parsed.bullets,
    model: json.model ?? "openai",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateSummary(report: Report): Promise<AiSummary> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    return realOpenAiSummary(report, apiKey);
  }

  await delay(MOCK_LATENCY_MS);

  // Deterministic-but-occasional failure for testing the error UI.
  if (MOCK_FAILURE_RATE > 0) {
    const seed = deterministicHash(report.id) % 100;
    if (seed < MOCK_FAILURE_RATE * 100) {
      throw new AiSummaryError("Mock AI provider is temporarily unavailable", 503);
    }
  }

  return mockSummary(report);
}
