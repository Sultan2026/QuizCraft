import pdfParse from "pdf-parse-fork";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text || "";
}

export function cleanExtractedText(input: string): string {
  if (!input) return "";
  // Remove non-printable except common whitespace, collapse spaces/newlines, trim
  const withoutControl = input.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]+/g, " ");
  const collapsedWhitespace = withoutControl.replace(/\s+/g, " ");
  // Normalize weird unicode spaces
  const normalized = collapsedWhitespace.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");
  return normalized.trim();
}








