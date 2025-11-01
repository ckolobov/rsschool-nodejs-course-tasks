import cluster from 'node:cluster';
import { User, CreateUserDto } from '../types/user.js';
import { userDatabase } from './userDatabase.js';

interface IPCMessage {
  messageId: string;
  result?: unknown;
  error?: string;
}

// Database proxy for workers that communicates via IPC
class DatabaseProxy {
  private sendMessage<T>(action: string, data: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!process.send) {
        reject(new Error('IPC not available'));
        return;
      }

      const messageId = Math.random().toString(36).substring(7);

      const handler = (msg: IPCMessage) => {
        if (msg.messageId === messageId) {
          process.off('message', handler);
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.result as T);
          }
        }
      };

      process.on('message', handler);

      process.send({
        type: 'db-operation',
        action,
        data,
        messageId,
      });
    });
  }

  create(userData: CreateUserDto): Promise<User> {
    return this.sendMessage<User>('create', userData);
  }

  getAllUsers(): Promise<User[]> {
    return this.sendMessage<User[]>('getAllUsers', {});
  }

  getUser(id: string): Promise<User | undefined> {
    return this.sendMessage<User | undefined>('getUser', { id });
  }

  update(id: string, userData: Partial<CreateUserDto>): Promise<User | null> {
    return this.sendMessage<User | null>('update', { id, userData });
  }

  delete(id: string): Promise<boolean> {
    return this.sendMessage<boolean>('delete', { id });
  }

  clear(): Promise<void> {
    return this.sendMessage<void>('clear', {});
  }
}

// Export appropriate instance based on process type
// Primary process uses the actual UserDatabase, workers use DatabaseProxy
export const sharedUserDatabase = cluster.isPrimary
  ? userDatabase
  : new DatabaseProxy();

export const isActualDatabase = () => {
  return cluster.isPrimary;
};
