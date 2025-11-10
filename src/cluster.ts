import 'dotenv/config';
import cluster, { Worker } from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
import { createServer } from './server.js';
import { isActualDatabase } from './database/sharedUserDatabase.js';
import { userDatabase } from './database/userDatabase.js';
import { CreateUserDto } from './types/user.js';

interface IPCOperationMessage {
  type: string;
  action: string;
  data: Record<string, unknown>;
  messageId: string;
}

const PORT = Number(process.env.PORT) || 3000;
const numWorkers = os.availableParallelism() - 1;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers...`);

  const workers: Worker[] = [];
  let currentWorkerIndex = 0;

  // Spawn workers
  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork({ WORKER_ID: i + 1, WORKER_PORT: PORT + i + 1 });
    workers.push(worker);

    // Handle IPC messages from workers (database operations)
    worker.on('message', async (msg: IPCOperationMessage) => {
      if (msg.type === 'db-operation' && isActualDatabase()) {
        try {
          let result;
          const { action, data } = msg;

          switch (action) {
            case 'create':
              result = userDatabase.create(data as CreateUserDto);
              break;
            case 'getAllUsers':
              result = userDatabase.getAllUsers();
              break;
            case 'getUser':
              result = userDatabase.getUser(data.id as string);
              break;
            case 'update':
              result = userDatabase.update(data.id as string, data.userData as Partial<CreateUserDto>);
              break;
            case 'delete':
              result = userDatabase.delete(data.id as string);
              break;
            case 'clear':
              result = userDatabase.clear();
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }

          worker.send({
            messageId: msg.messageId,
            result,
          });
        } catch (error) {
          worker.send({
            messageId: msg.messageId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optionally restart the worker
    const index = workers.indexOf(worker);
    if (index > -1) {
      const newWorker = cluster.fork({ WORKER_ID: index + 1, WORKER_PORT: PORT + index + 1 });
      workers[index] = newWorker;
    }
  });

  // Create load balancer on PORT
  const loadBalancer = http.createServer((req, res) => {
    const workerPort = PORT + currentWorkerIndex + 1;

    // Update round-robin index
    currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;

    // Forward request to worker
    const options = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error(`Error forwarding to worker on port ${workerPort}:`, error);
      res.writeHead(503);
      res.end(JSON.stringify({ message: 'Service temporarily unavailable' }));
    });

    req.pipe(proxyReq);
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer listening on http://localhost:${PORT}`);
    console.log(`Workers running on ports ${PORT + 1} to ${PORT + numWorkers}`);
  });
} else {
  // Worker process
  const workerPort = Number(process.env.WORKER_PORT) || PORT + 1;

  const server = createServer();

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} listening on http://localhost:${workerPort}`);
  });
}
