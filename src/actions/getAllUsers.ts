import http from 'node:http';
import { userDatabase } from '../database/userDatabase.js';

interface GetAllUsersParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
}

export const getAllUsers = async ({ res }: GetAllUsersParams) => {
  const users = userDatabase.getAllUsers();
  res.statusCode = 200;
  res.end(JSON.stringify(users));
};
