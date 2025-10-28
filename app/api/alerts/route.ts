import { type NextRequest, NextResponse } from "next/server"
import { mockAlerts } from "@/lib/mock-data"
import { db, isDbAvailable } from "@/lib/db"
import type { Server as SocketIOServer } from "socket.io"

declare global {
  var io: SocketIOServer | undefined
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const severity = searchParams.get("severity")
    const search = searchParams.get("search")
    const useRealData = searchParams.get("real") === "true" // Parâmetro para forçar dados reais

    // Se solicitado dados reais ou se o banco estiver disponível, tenta usar dados reais
    if (useRealData && isDbAvailable() && db) {
      try {
        const poolClient = await db.connect();
        try {
          let query = `
            SELECT
              id,
              client_id,
              client_name,
              alert_type,
              severity,
              title,
              description,
              status,
              created_at,
              updated_at,
              source,
              metadata
            FROM alerts
            WHERE 1=1
          `;
          const params = [];
          let paramIndex = 1;

          // Filtrar por status
          if (status && status !== "all") {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
          }

          // Filtrar por severidade
          if (severity && severity !== "all") {
            query += ` AND severity = $${paramIndex}`;
            params.push(severity);
            paramIndex++;
          }

          // Filtrar por busca
          if (search) {
            query += ` AND (
              title ILIKE $${paramIndex} OR
              client_name ILIKE $${paramIndex} OR
              description ILIKE $${paramIndex}
            )`;
            params.push(`%${search}%`);
            paramIndex++;
          }

          query += ` ORDER BY created_at DESC`;

          const result = await poolClient.query(query, params);
          const alerts = result.rows.map(row => ({
            ...row,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
          }));

          return NextResponse.json({
            alerts,
            total: alerts.length,
            source: "database"
          });
        } finally {
          poolClient.release();
        }
      } catch (dbError) {
        console.error("Erro ao buscar dados reais:", dbError);
        // Continua para dados mockados
      }
    }

    // Fallback para dados mockados
    let filteredAlerts = [...mockAlerts]

    // Filtrar por status
    if (status && status !== "all") {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status)
    }

    // Filtrar por severidade
    if (severity && severity !== "all") {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.title.toLowerCase().includes(searchLower) ||
        alert.client_name.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      alerts: filteredAlerts,
      total: filteredAlerts.length,
      source: "mock"
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts
 * Recebe alertas dos agentes dos clientes
 */
export async function POST(request: NextRequest) {
  // 1. Verificação de Segurança
  const authHeader = request.headers.get('authorization');
  const apiToken = process.env.API_SECRET_TOKEN;

  if (!apiToken) {
    console.error("API_SECRET_TOKEN não está configurado no servidor.");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${apiToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      client_id,
      client_name,
      alert_type,
      severity,
      title,
      description,
      source = 'client_monitor',
      metadata = {}
    } = body;

    // 2. Validação dos dados recebidos
    if (!client_id || !client_name || !alert_type || !severity || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verificar se o banco está disponível
    if (!isDbAvailable() || !db) {
      console.log("Banco não disponível, alerta não pode ser criado");
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const poolClient = await db.connect();
    try {
      await poolClient.query('BEGIN');

      // 3. Verifica se já existe alerta similar recente (evita duplicatas)
      const duplicateCheck = await poolClient.query(
        `SELECT id FROM alerts
         WHERE client_id = $1
         AND alert_type = $2
         AND status IN ('open', 'in_progress')
         AND created_at > NOW() - INTERVAL '1 hour'`,
        [client_id, alert_type]
      );

      if (duplicateCheck.rows.length > 0) {
        await poolClient.query('ROLLBACK');
        return NextResponse.json({
          message: "Alert already exists",
          alert_id: duplicateCheck.rows[0].id
        }, { status: 200 });
      }

      // 4. Insere o alerta no banco
      const insertQuery = `
        INSERT INTO alerts (client_id, client_name, alert_type, severity, title, description, source, metadata, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
        RETURNING id, created_at
      `;

      const result = await poolClient.query(insertQuery, [
        client_id,
        client_name,
        alert_type,
        severity,
        title,
        description,
        source,
        JSON.stringify(metadata)
      ]);

      const newAlertId = result.rows[0].id;
      const createdAt = result.rows[0].created_at;

      // 5. Verifica se deve enviar notificação
      const shouldNotify = severity === 'critical' || severity === 'high';

      if (shouldNotify) {
        const recipient = process.env.NOTIFICATION_EMAIL_RECIPIENT;
        if (recipient) {
          // Dispara notificação
          const notificationPayload = {
            alertId: newAlertId,
            channels: ['email'],
            recipients: { email: recipient },
            alert: {
              title,
              description,
              severity,
              clientName: client_name,
            }
          };

          const notificationUrl = new URL('/api/notifications/send', request.url).toString();

          // Não esperamos resposta para não bloquear
          fetch(notificationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationPayload),
          });

          console.log(`Notificação enviada para ${recipient} - Alerta ${newAlertId}`);
        }
      }

      await poolClient.query('COMMIT');

      // Emitir evento Socket.IO para atualização em tempo real
      if (typeof global.io !== 'undefined') {
        global.io.to('alerts').emit('alert-update', {
          type: 'new_alert',
          alert: {
            id: newAlertId,
            client_id,
            client_name,
            alert_type,
            severity,
            title,
            description,
            status: 'open',
            created_at: createdAt
          }
        });
      }

      return NextResponse.json({
        message: "Alert created successfully",
        alert_id: newAlertId,
        created_at: createdAt
      }, { status: 201 });

    } catch (e) {
      await poolClient.query('ROLLBACK');
      throw e;
    } finally {
      poolClient.release();
    }

  } catch (error) {
    console.error("Erro em POST /api/alerts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
