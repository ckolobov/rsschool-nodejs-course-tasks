import http from 'node:http';
import { sharedUserDatabase } from '../database/sharedUserDatabase.js';

interface GetAllUsersParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
}

export const getAllUsers = async ({ res }: GetAllUsersParams) => {
  try {
    const users = await sharedUserDatabase.getAllUsers();
    res.statusCode = 200;
    res.end(JSON.stringify(users));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
    );
  }
};
