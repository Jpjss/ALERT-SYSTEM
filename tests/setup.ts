// Configuração global para testes
beforeAll(async () => {
  // Configurações globais de teste
  jest.setTimeout(30000); // 30 segundos timeout

  // Configurações específicas para testes de API
  Object.assign(process.env, {
    NODE_ENV: 'test',
    API_SECRET_TOKEN: 'test_token_123'
  });
});

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});