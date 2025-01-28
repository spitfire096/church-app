'use strict';

import net from 'net';
import { config } from 'dotenv';

config(); // Load environment variables

const DEFAULT_PORT = 5000;
const MAX_PORT_SEARCH = 5; // Will try 5000, 5001, 5002, etc.

export async function findAvailablePort(startPort: number = DEFAULT_PORT): Promise<number> {
  for (let port = startPort; port < startPort + MAX_PORT_SEARCH; port++) {
    try {
      await checkPort(port);
      return port;
    } catch {
      continue;
    }
  }
  throw new Error('No available ports found');
}

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(false);
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
} 