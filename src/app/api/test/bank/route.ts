import { NextResponse } from "next/server";
import { getDimensionsByLocale, getApprovedQuestionsByLocale } from "@/models/test";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";
    const [dimensions, questions] = await Promise.all([
      getDimensionsByLocale(locale),
      getApprovedQuestionsByLocale(locale),
    ]);
    return NextResponse.json({
      version: "v1",
      locale,
      dimensions,
      questions,
    });
  } catch (error) {
    return new NextResponse("Failed to load test bank", { status: 500 });
  }
}


