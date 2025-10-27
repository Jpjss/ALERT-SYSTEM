import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Inicializar Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Inicializar Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Gerenciar conexões Socket.IO
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Entrar em sala de alertas
    socket.on('join-alerts', () => {
      socket.join('alerts');
      console.log(`Cliente ${socket.id} entrou na sala de alertas`);
    });

    // Entrar em sala de status
    socket.on('join-status', () => {
      socket.join('status');
      console.log(`Cliente ${socket.id} entrou na sala de status`);
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  // Exportar io para uso em outras partes da aplicação
  global.io = io;

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server initialized`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});