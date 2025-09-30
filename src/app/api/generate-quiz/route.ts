import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse-fork";

// If you have a shared Prisma client util, replace this with that import
// and remove the inline instantiation below.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs"; // Required for pdf-parse (Node APIs)

type Difficulty = "easy" | "medium" | "hard";

function parseQuery(request: NextRequest): { numQuestions: number; difficulty: Difficulty } {
  const { searchParams } = new URL(request.url);
  const numQuestionsParam = Number(searchParams.get("numQuestions") ?? "10");
  const difficultyParam = (searchParams.get("difficulty") as Difficulty) ?? "medium";

  const numQuestions = Number.isFinite(numQuestionsParam)
    ? Math.min(15, Math.max(5, numQuestionsParam))
    : 10;

  const difficulty: Difficulty = ["easy", "medium", "hard"].includes(difficultyParam)
    ? difficultyParam
    : "medium";

  return { numQuestions, difficulty };
}

async function readMultipartOrText(request: NextRequest): Promise<{ text: string; sourceType: "text" | "file"; }> {
  const contentType = request.headers.get("content-type") || "";

  // If multipart, expect field names: file (optional), text (optional)
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const textField = (form.get("text") as string) || "";
    const file = form.get("file") as File | null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let extracted = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const pdfData = await pdfParse(buffer);
        extracted = pdfData.text || "";
      } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        extracted = buffer.toString("utf8");
      } else {
        throw new Error("Unsupported file type. Please upload PDF or TXT.");
      }

      const combined = `${textField}\n${extracted}`.trim();
      return { text: combined, sourceType: "file" };
    }

    return { text: textField.trim(), sourceType: "text" };
  }

  // Otherwise, treat as raw text body
  const rawText = await request.text();
  return { text: rawText.trim(), sourceType: "text" };
}

function buildPrompt({ text, numQuestions, difficulty }: { text: string; numQuestions: number; difficulty: Difficulty }) {
  const system = `You are an assistant that generates high-quality multiple-choice quiz questions based strictly on the provided source content.`;
  const user = `Generate ${numQuestions} ${difficulty} difficulty multiple-choice questions based on the content below.

Content:
"""
${text}
"""

Return ONLY valid JSON with this exact shape:
{
  "title": string, // a concise quiz title
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "answer": string // must exactly match one of the options
    }
  ]
}`;
  return { system, user };
}

async function callOpenAIForQuiz({ text, numQuestions, difficulty }: { text: string; numQuestions: number; difficulty: Difficulty }) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  if (!openai.apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const { system, user } = buildPrompt({ text, numQuestions, difficulty });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response");
  }

  // Minimal validation
  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("OpenAI returned invalid quiz format");
  }

  return parsed as { title: string; questions: Array<{ question: string; options: string[]; answer: string }>; };
}

export async function POST(request: NextRequest) {
  try {
    const { numQuestions, difficulty } = parseQuery(request);
    const { text, sourceType } = await readMultipartOrText(request);

    if (!text) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const quiz = await callOpenAIForQuiz({ text, numQuestions, difficulty });

    // Save to DB (Prisma)
    const saved = await prisma.quiz.create({
      data: {
        title: quiz.title || "Generated Quiz",
        questions: quiz.questions as unknown as any, // Prisma JSON type
        sourceType,
      },
    });

    return NextResponse.json({ id: saved.id, title: saved.title, questions: quiz.questions, sourceType: saved.sourceType, createdAt: saved.createdAt });
  } catch (error: any) {
    const message = error?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


