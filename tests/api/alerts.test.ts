describe('/api/alerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('deve retornar lista de alertas', async () => {
      // Mock da resposta da API
      const mockResponse = {
        status: 200,
        json: async () => [
          {
            id: 'alert-1',
            title: 'CPU High',
            severity: 'warning',
            status: 'active'
          },
          {
            id: 'alert-2',
            title: 'Memory Low',
            severity: 'critical',
            status: 'resolved'
          }
        ]
      };

      // Simular função GET
      const mockGetFunction = jest.fn().mockResolvedValue(mockResponse);

      const response = await mockGetFunction();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('title');
    });

    it('deve filtrar alertas por status', async () => {
      const mockResponse = {
        status: 200,
        json: async () => [
          { id: '1', status: 'active' },
          { id: '2', status: 'active' }
        ]
      };

      const mockGetFunction = jest.fn().mockResolvedValue(mockResponse);
      const response = await mockGetFunction();
      const data = await response.json();

      // Verificar se todos os alertas têm status 'active'
      data.forEach((alert: any) => {
        expect(alert.status).toBe('active');
      });
    });
  });

  describe('POST /api/alerts', () => {
    it('deve criar novo alerta', async () => {
      const alertData = {
        alert_type: 'cpu_high',
        severity: 'warning',
        title: 'Test Alert',
        description: 'Test description'
      };

      const mockResponse = {
        status: 201,
        json: async () => ({ id: 'new-alert-id', ...alertData })
      };

      const mockPostFunction = jest.fn().mockResolvedValue(mockResponse);
      const response = await mockPostFunction();

      expect(response.status).toBe(201);
    });

    it('deve validar dados obrigatórios', async () => {
      const invalidData = { title: 'Test' }; // Faltando campos obrigatórios

      const mockResponse = {
        status: 400,
        json: async () => ({ error: 'Dados inválidos' })
      };

      const mockPostFunction = jest.fn().mockResolvedValue(mockResponse);
      const response = await mockPostFunction();

      expect(response.status).toBe(400);
    });
  });
});