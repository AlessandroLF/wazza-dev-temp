import { NextResponse } from "next/server";
import { getFlags } from "@/lib/flags";

export async function GET() {
  const flags = await getFlags();
  return NextResponse.json(flags);
}