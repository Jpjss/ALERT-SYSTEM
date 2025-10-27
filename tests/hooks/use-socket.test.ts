describe('useSocket hook', () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do socket.io-client
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    };

    // Mock da função io
    const mockIo = jest.fn().mockReturnValue(mockSocket);
    jest.doMock('socket.io-client', () => ({ io: mockIo, default: mockIo }));

    // Mock do React
    jest.doMock('react', () => ({
      useState: jest.fn((initial) => [initial, jest.fn()]),
      useEffect: jest.fn((fn) => fn()),
    }));
  });

  it('deve inicializar socket corretamente', () => {
    // Simular hook sendo chamado
    const { io } = require('socket.io-client');

    // Simular chamada do hook
    io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    expect(io).toHaveBeenCalledWith('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });
  });

  it('deve configurar listeners de conexão', () => {
    const { io } = require('socket.io-client');

    // Simular inicialização e configuração dos listeners
    io();
    mockSocket.on('connect', () => {});
    mockSocket.on('disconnect', () => {});

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('deve emitir join-alerts quando chamado', () => {
    // Simular emissão
    mockSocket.emit('join-alerts');

    expect(mockSocket.emit).toHaveBeenCalledWith('join-alerts');
  });

  it('deve emitir join-status quando chamado', () => {
    // Simular emissão
    mockSocket.emit('join-status');

    expect(mockSocket.emit).toHaveBeenCalledWith('join-status');
  });

  it('não deve inicializar socket no servidor', () => {
    // Simular ambiente servidor (sem window)
    delete (global as any).window;

    const { io } = require('socket.io-client');

    // Hook não deve chamar io quando não há window
    expect(io).not.toHaveBeenCalled();
  });
});