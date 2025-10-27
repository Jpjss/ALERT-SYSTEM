import { NextResponse } from "next/server"
import { getAlertStats } from "@/lib/mock-data"

export async function GET() {
  try {
    const stats = getAlertStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
