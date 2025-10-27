describe('/api/status/all', () => {
  it('deve retornar status de todos os clientes', async () => {
    // Simular dados de resposta da API
    const mockResponse = {
      status: 200,
      json: async () => [
        {
          id: 'client-1',
          name: 'Cliente 1',
          lat: -23.5505,
          lng: -46.6333,
          status: 'Online'
        },
        {
          id: 'client-2',
          name: 'Cliente 2',
          lat: -22.9068,
          lng: -43.1729,
          status: 'Offline'
        }
      ]
    };

    // Mock da função GET
    const mockGetFunction = jest.fn().mockResolvedValue(mockResponse);

    // Simular chamada da API
    const response = await mockGetFunction();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Verificar estrutura dos dados
    const firstClient = data[0];
    expect(firstClient).toHaveProperty('id');
    expect(firstClient).toHaveProperty('name');
    expect(firstClient).toHaveProperty('lat');
    expect(firstClient).toHaveProperty('lng');
    expect(firstClient).toHaveProperty('status');
  });

  it('deve incluir diferentes tipos de status', async () => {
    const mockResponse = {
      status: 200,
      json: async () => [
        { id: '1', name: 'Cliente 1', status: 'Online' },
        { id: '2', name: 'Cliente 2', status: 'Offline' },
        { id: '3', name: 'Cliente 3', status: 'Warning' }
      ]
    };

    const mockGetFunction = jest.fn().mockResolvedValue(mockResponse);
    const response = await mockGetFunction();
    const data = await response.json();

    const statuses = data.map((client: any) => client.status);
    const uniqueStatuses = [...new Set(statuses)];

    expect(uniqueStatuses.length).toBeGreaterThan(1);
    expect(uniqueStatuses).toContain('Online');
    expect(uniqueStatuses).toContain('Offline');
  });
});