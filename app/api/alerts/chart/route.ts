import { NextResponse } from "next/server"
import { getChartData } from "@/lib/mock-data"

export async function GET() {
  try {
    // TODO: Quando conectar ao banco, substituir por query real
    // const query = `
    //   SELECT 
    //     DATE(created_at) as date,
    //     COUNT(*) FILTER (WHERE severity = 'critical') as critical,
    //     COUNT(*) FILTER (WHERE severity = 'high') as high,
    //     COUNT(*) FILTER (WHERE severity = 'medium') as medium,
    //     COUNT(*) FILTER (WHERE severity = 'low') as low
    //   FROM alerts
    //   WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
    //   GROUP BY DATE(created_at)
    //   ORDER BY date ASC
    // `
    
    const chartData = getChartData()
    
    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
