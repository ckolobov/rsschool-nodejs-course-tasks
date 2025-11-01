import http from 'node:http';
import { sharedUserDatabase } from '../database/sharedUserDatabase.js';

interface GetAllUsersParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
}

export const getAllUsers = async ({ res }: GetAllUsersParams) => {
  const users = await sharedUserDatabase.getAllUsers();
  res.statusCode = 200;
  res.end(JSON.stringify(users));
};
