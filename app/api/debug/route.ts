import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    COMMIT_REF: process.env.COMMIT_REF,
    BRANCH: process.env.BRANCH,
    CONTEXT: process.env.CONTEXT,
  });
}