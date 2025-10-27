import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";

/**
 * GET /api/status/all
 * Retorna o status mais recente de todos os clientes para o mapa.
 * Agora usa dados reais do banco de dados.
 */
export async function GET() {
  try {
    // Simular pequeno delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar se o banco está disponível
    if (!isDbAvailable() || !db) {
      console.log("Banco não disponível, usando dados mockados");
      return getMockData();
    }

    const poolClient = await db.connect();
    try {
      // Busca todos os clientes com status atual
      const query = `
        SELECT
          client_id as id,
          name,
          latitude as lat,
          longitude as lng,
          status,
          last_updated
        FROM client_status
        ORDER BY last_updated DESC
      `;

      const result = await poolClient.query(query);
      const clients = result.rows;

      return NextResponse.json(clients);
    } finally {
      poolClient.release();
    }
  } catch (error) {
    console.error("Error in /api/status/all:", error);

    // Fallback para dados mockados se o banco não estiver disponível
    console.log("Usando dados mockados como fallback");
    return getMockData();
  }
}

// Função para retornar dados mockados
function getMockData() {
  const mockClientLocations = [
    // Centro de São Paulo
    { id: "CLI001", name: "Tech Solutions SP", lat: -23.5505, lng: -46.6333, status: "Online" },
    { id: "CLI002", name: "Digital Corp", lat: -23.5489, lng: -46.6388, status: "Alerta" },
    { id: "CLI003", name: "Cloud Systems", lat: -23.5577, lng: -46.6395, status: "Online" },

    // Zona Sul
    { id: "CLI004", name: "Mega Store Sul", lat: -23.6261, lng: -46.6564, status: "Online" },
    { id: "CLI005", name: "Shopping Center", lat: -23.6178, lng: -46.6984, status: "Sem Internet" },
    { id: "CLI006", name: "Retail Plus", lat: -23.5986, lng: -46.6898, status: "Online" },

    // Zona Norte
    { id: "CLI007", name: "North Tech", lat: -23.4986, lng: -46.6211, status: "Online" },
    { id: "CLI008", name: "Innovation Hub", lat: -23.5156, lng: -46.6094, status: "Alerta" },
    { id: "CLI009", name: "Smart Business", lat: -23.4798, lng: -46.5436, status: "Offline" },

    // Zona Leste
    { id: "CLI010", name: "East Solutions", lat: -23.5619, lng: -46.4775, status: "Online" },
    { id: "CLI011", name: "Logistics Center", lat: -23.5542, lng: -46.5234, status: "Online" },
    { id: "CLI012", name: "Distribution Hub", lat: -23.5398, lng: -46.4632, status: "Sem Internet" },

    // Zona Oeste
    { id: "CLI013", name: "West Commerce", lat: -23.5641, lng: -46.7243, status: "Online" },
    { id: "CLI014", name: "Business Park", lat: -23.5344, lng: -46.7456, status: "Online" },
    { id: "CLI015", name: "Corporate Tower", lat: -23.5491, lng: -46.6875, status: "Alerta" },

    // Região Metropolitana
    { id: "CLI016", name: "Guarulhos Tech", lat: -23.4538, lng: -46.5333, status: "Online" },
    { id: "CLI017", name: "ABC Industries", lat: -23.6528, lng: -46.5417, status: "Online" },
    { id: "CLI018", name: "Osasco Systems", lat: -23.5329, lng: -46.7919, status: "Offline" },
    { id: "CLI019", name: "Barueri Data Center", lat: -23.5106, lng: -46.8761, status: "Online" },
    { id: "CLI020", name: "Taboão Tech", lat: -23.6103, lng: -46.7578, status: "Online" },

    // Rio Grande do Sul
    { id: "CLI021", name: "Porto Alegre Tech", lat: -30.0346, lng: -51.2177, status: "Online" },
    { id: "CLI022", name: "Caxias Solutions", lat: -29.1685, lng: -51.1794, status: "Alerta" },
    { id: "CLI023", name: "Pelotas Systems", lat: -31.7719, lng: -52.3425, status: "Online" },
    { id: "CLI024", name: "Gramado Digital", lat: -29.3742, lng: -50.8764, status: "Sem Internet" },

    // Santa Catarina
    { id: "CLI025", name: "Florianópolis Corp", lat: -27.5969, lng: -48.5495, status: "Online" },
    { id: "CLI026", name: "Joinville Hub", lat: -26.3044, lng: -48.8464, status: "Alerta" },
    { id: "CLI027", name: "Blumenau Tech", lat: -26.9194, lng: -49.0661, status: "Online" },
    { id: "CLI028", name: "Chapecó Systems", lat: -27.0964, lng: -52.6183, status: "Offline" },

    // Paraná
    { id: "CLI029", name: "Curitiba Solutions", lat: -25.4284, lng: -49.2733, status: "Online" },
    { id: "CLI030", name: "Londrina Digital", lat: -23.3105, lng: -51.1628, status: "Online" },
    { id: "CLI031", name: "Maringá Corp", lat: -23.4253, lng: -51.9382, status: "Sem Internet" },
    { id: "CLI032", name: "Ponta Grossa Hub", lat: -25.0945, lng: -50.1619, status: "Alerta" },
  ];

  return NextResponse.json(mockClientLocations);
}