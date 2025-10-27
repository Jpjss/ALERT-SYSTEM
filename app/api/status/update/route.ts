import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/status/update
 * Recebe e atualiza o status de um cliente.
 * Usa 'INSERT ... ON CONFLICT' para criar ou atualizar o registro.
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
    const { client_id, client_name, latitude, longitude, status: newStatus, metrics } = body;

    // 2. Validação dos dados recebidos
    if (!client_id || !client_name || !latitude || !longitude || !newStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const poolClient = await db.connect();
    try {
      await poolClient.query('BEGIN');

      // 3. Busca o status anterior do cliente
      const previousStatusResult = await poolClient.query(
        'SELECT status FROM client_status WHERE client_id = $1',
        [client_id]
      );
      const oldStatus = previousStatusResult.rows[0]?.status;

      // 4. Atualiza o status do cliente na tabela client_status (Upsert)
      const upsertQuery = `
        INSERT INTO client_status (client_id, name, latitude, longitude, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (client_id) 
        DO UPDATE SET
          name = EXCLUDED.name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          status = EXCLUDED.status,
          last_updated = NOW();
      `;
      await poolClient.query(upsertQuery, [client_id, client_name, latitude, longitude, newStatus]);

      // Inserir métricas no histórico
      if (metrics && typeof metrics.cpu_usage !== 'undefined') {
        const { cpu_usage, memory_usage, disk_usage } = metrics;
        await poolClient.query(
          `INSERT INTO metrics_history (client_id, cpu_usage, memory_usage, disk_usage) VALUES ($1, $2, $3, $4)`,
          [client_id, cpu_usage, memory_usage, disk_usage]
        );
      }

      // 5. Verifica se uma notificação deve ser enviada
      const isCriticalChange = newStatus !== 'Online' && oldStatus === 'Online';

      if (isCriticalChange) {
        const recipient = process.env.NOTIFICATION_EMAIL_RECIPIENT;
        if (recipient) {
          // 6a. Cria um registro de alerta na tabela 'alerts'
          const alertTitle = `Cliente '${client_name}' mudou status para '${newStatus}'`;
          const alertDescription = `O status do cliente ${client_name} (ID: ${client_id}) foi alterado para ${newStatus}. Por favor, verifique a situação.`;
          
          const alertResult = await poolClient.query(
            `INSERT INTO alerts (client_id, client_name, alert_type, severity, title, description, source, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [client_id, client_name, 'status_change', 'medium', alertTitle, alertDescription, 'auto_monitor', 'open']
          );
          const newAlertId = alertResult.rows[0].id;

          // 6b. Dispara a notificação chamando a API interna
          const notificationPayload = {
            alertId: newAlertId,
            channels: ['email'],
            recipients: { email: recipient },
            alert: {
              title: alertTitle,
              description: alertDescription,
              severity: 'medium',
              clientName: client_name,
            }
          };
          
          const notificationUrl = new URL('/api/notifications/send', request.url).toString();

          // Não esperamos a resposta para não bloquear o fluxo principal
          fetch(notificationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationPayload),
          });

          console.log(`Notificação disparada para ${recipient} devido à mudança de status do cliente ${client_id}.`);
        }
      }

      await poolClient.query('COMMIT');

      // Emitir evento Socket.IO para atualização em tempo real
      if (typeof global.io !== 'undefined') {
        global.io.to('status').emit('status-update', {
          type: 'status_changed',
          client: {
            id: client_id,
            name: client_name,
            status: newStatus,
            latitude,
            longitude,
            last_updated: new Date().toISOString()
          }
        });
      }

      return NextResponse.json({ message: "Status updated successfully" }, { status: 200 });

    } catch (e) {
      await poolClient.query('ROLLBACK');
      throw e;
    } finally {
      poolClient.release();
    }

  } catch (error) {
    console.error("Erro em /api/status/update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
