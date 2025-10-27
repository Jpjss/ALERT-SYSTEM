import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Configure nodemailer transporter
// In production, use environment variables for email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Severity color mapping for email styling
const severityColors = {
  critical: "#dc2626",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#10b981",
}

// Generate HTML email template
function generateEmailHTML(alert: {
  title: string
  description: string
  severity: string
  clientName: string
}) {
  const severityColor = severityColors[alert.severity as keyof typeof severityColors] || "#3b82f6"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta: ${alert.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${severityColor}; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      🔔 Novo Alerta
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="margin-bottom: 20px;">
                      <span style="display: inline-block; padding: 6px 12px; background-color: ${severityColor}20; color: ${severityColor}; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${alert.severity === "critical" ? "Crítica" : alert.severity === "high" ? "Alta" : alert.severity === "medium" ? "Média" : "Baixa"}
                      </span>
                    </div>
                    
                    <h2 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                      ${alert.title}
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px;">
                      Cliente: <strong>${alert.clientName}</strong>
                    </p>
                    
                    <div style="background-color: #f9f9f9; border-left: 4px solid ${severityColor}; padding: 16px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                        ${alert.description}
                      </p>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px;">
                      Este é um alerta automático do Sistema de Alertas. Por favor, tome as ações necessárias.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Sistema de Alertas. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, channels, recipients, alert } = body

    // Validate required fields
    if (!alertId || !channels || !recipients || !alert) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const results = []

    // Send email notification
    if (channels.includes("email") && recipients.email) {
      try {
        // Check if SMTP credentials are configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
          console.warn("SMTP credentials not configured. Email will be simulated.")
          // Simulate email sending in development
          results.push({
            channel: "email",
            recipient: recipients.email,
            status: "sent",
            message: "Email simulated (SMTP not configured)",
          })
        } else {
          // Send actual email
          const info = await transporter.sendMail({
            from: `"Sistema de Alertas" <${process.env.SMTP_USER}>`,
            to: recipients.email,
            subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            html: generateEmailHTML(alert),
          })

          results.push({
            channel: "email",
            recipient: recipients.email,
            status: "sent",
            messageId: info.messageId,
          })
        }
      } catch (error) {
        console.error("Error sending email:", error)
        results.push({
          channel: "email",
          recipient: recipients.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Send WhatsApp notification (simulated)
    if (channels.includes("whatsapp") && recipients.phone) {
      // In production, integrate with WhatsApp Business API or Twilio
      console.log("WhatsApp notification would be sent to:", recipients.phone)
      results.push({
        channel: "whatsapp",
        recipient: recipients.phone,
        status: "sent",
        message: "WhatsApp notification simulated",
      })
    }

    // Check if all notifications were successful
    const allSuccessful = results.every((r) => r.status === "sent")

    return NextResponse.json({
      success: allSuccessful,
      results,
      alertId,
    })
  } catch (error) {
    console.error("Error in notification API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
