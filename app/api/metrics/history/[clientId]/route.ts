import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const hours = request.nextUrl.searchParams.get("hours") || '6'; // Padrão de 6 horas

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const query = `
      SELECT 
        to_char(created_at, 'HH24:MI') as time,
        cpu_usage,
        memory_usage
      FROM 
        metrics_history
      WHERE 
        client_id = $1 AND created_at >= NOW() - $2::interval
      ORDER BY 
        created_at ASC;
    `;
    
    const interval = `${parseInt(hours)} hours`;

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const result = await db.query(query, [clientId, interval]);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Database Error (GET /api/metrics/history):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
