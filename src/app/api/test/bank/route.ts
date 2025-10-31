import { NextResponse } from "next/server";
import { loadTestBank } from "@/services/test-bank";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";
    const bank = await loadTestBank(locale);
    return NextResponse.json(bank);
  } catch (error) {
    console.error("Failed to load test bank:", error);
    return new NextResponse("Failed to load test bank", { status: 500 });
  }
}


