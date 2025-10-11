import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse-fork";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ 
        success: false,
        error: "Expected multipart/form-data content type" 
      }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: "No file provided. Please select a PDF file to parse." 
      }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid file type. Only PDF files are supported." 
      }, { status: 400 });
    }

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false,
        error: `File exceeds 3MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 400 });
    }

    // Convert file to buffer using stream-based approach for better compatibility
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (bufferError) {
      return NextResponse.json({ 
        success: false,
        error: "Failed to read file. Please try another PDF file." 
      }, { status: 400 });
    }

    // Parse PDF using pdf-parse-fork
    let extractedText: string;
    try {
      const result = await pdfParse(buffer, {
        max: 0, // No page limit
        version: 'v1.10.100', // Use specific version for stability
      });
      
      extractedText = result.text || "";
      
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "This PDF might be locked or unreadable. Try another file." 
        }, { status: 400 });
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json({ 
        success: false,
        error: "This PDF might be locked or unreadable. Try another file." 
      }, { status: 400 });
    }

    // Return the extracted text
    return NextResponse.json({ 
      success: true,
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      textLength: extractedText.length
    });

  } catch (error: any) {
    console.error("PDF parsing API error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error during PDF parsing" 
    }, { status: 500 });
  }
}
