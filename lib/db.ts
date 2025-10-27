import { Pool } from 'pg';

// Apenas uma instância do pool é criada para toda a aplicação
let pool: Pool | null = null;

// Flag para indicar se o banco está disponível
let dbAvailable = false;

if (!pool) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Timeout de conexão reduzido para não travar o servidor
      connectionTimeoutMillis: 5000,
    });

    // Testa a conexão
    pool.connect().then(() => {
      console.log('✅ Banco de dados conectado com sucesso');
      dbAvailable = true;
    }).catch((err) => {
      console.warn('⚠️  Banco de dados não disponível, usando dados mockados:', err.message);
      dbAvailable = false;
    });
  } catch (error) {
    console.warn('⚠️  Erro ao inicializar banco de dados, usando dados mockados');
    dbAvailable = false;
  }
}

export const db = pool;
export const isDbAvailable = () => dbAvailable;
