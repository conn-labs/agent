import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import morgan from 'morgan';
import { createServer, Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';

const app: Express = express();
const server: HttpServer = createServer(app);
const wss: WebSocketServer = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// HTTP Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Bun-Express server with WebSocket routing!');
});


// WebSocket Types
type WsHandler = (ws: WebSocket, data: any, clients: Set<WebSocket>) => void;

// WebSocket Routing
const wsRoutes: Map<string, WsHandler> = new Map();

// Function to load WebSocket routes
function loadWsRoutes(directory: string): void {
    const absolutePath = path.resolve(directory);
    console.log(`Attempting to load WebSocket routes from: ${absolutePath}`);
  
    if (!fs.existsSync(absolutePath)) {
      console.error(`Directory does not exist: ${absolutePath}`);
      return;
    }
  
    const files = fs.readdirSync(absolutePath);
    console.log(`Files found in directory: ${files.join(', ')}`);
  
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const route = '/' + file.slice(0, -3); // Remove .ts extension
        const fullPath = path.join(absolutePath, file);
        console.log(`Attempting to load route handler from: ${fullPath}`);
  
        try {
          const handler: WsHandler = require(fullPath).default;
          if (typeof handler === 'function') {
            wsRoutes.set(route, handler);
            console.log(`Successfully loaded route handler for: ${route}`);
          } else {
            console.error(`Invalid handler in file ${file}: expected a function, got ${typeof handler}`);
          }
        } catch (error) {
          console.error(`Error loading route handler from ${fullPath}:`, error);
        }
      }
    });
  
    console.log(`Loaded WebSocket routes: ${Array.from(wsRoutes.keys()).join(', ')}`);
  }
  
  // Usage
  loadWsRoutes('./src/api/sockets');       

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('A user connected');

  ws.on('message', (message: string) => {
    try {
      const { route, data } = JSON.parse(message.toString());
      if (wsRoutes.has(route)) {
        wsRoutes.get(route)!(ws, data, wss.clients);
      } else {
        ws.send(JSON.stringify({ error: 'Route not found' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server shut down");
    process.exit(0);
  });
});