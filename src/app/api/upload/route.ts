import { NextRequest, NextResponse } from "next/server";
import { extractPdfText, cleanExtractedText } from "@/lib/file-parser";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const SUPPORTED_TYPES = ["application/pdf", "text/plain"]; // pdf, txt

async function getCleanTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("File exceeds 3MB limit");
  }

  const nameLower = file.name.toLowerCase();
  const type = file.type || (nameLower.endsWith(".pdf") ? "application/pdf" : nameLower.endsWith(".txt") ? "text/plain" : "");

  if (!SUPPORTED_TYPES.includes(type)) {
    throw new Error("Unsupported file type. Only PDF and TXT are allowed.");
  }

  let rawText = "";
  if (type === "application/pdf") {
    rawText = await extractPdfText(buffer);
  } else if (type === "text/plain") {
    rawText = buffer.toString("utf8");
  }

  return cleanExtractedText(rawText);
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }

    const cleanedText = await getCleanTextFromFile(file);

    // Forward to quiz generation API with authentication
    const url = new URL("/api/generate-quiz", request.url);
    const numQuestions = form.get("numQuestions")?.toString();
    const difficulty = form.get("difficulty")?.toString();
    if (numQuestions) url.searchParams.set("numQuestions", numQuestions);
    if (difficulty) url.searchParams.set("difficulty", difficulty);

    // Get the authorization header from the original request
    const authHeader = request.headers.get("authorization");
    
    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: { 
        "content-type": "text/plain",
        ...(authHeader && { "authorization": authHeader }),
      },
      body: cleanedText,
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || "Failed to generate quiz" }, { status: resp.status });
    }

    return NextResponse.json({ ...data, bytes: file.size, fileName: file.name });
  } catch (error: any) {
    // Handle authentication errors
    if (error instanceof Response) {
      return error;
    }
    
    const message = error?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


