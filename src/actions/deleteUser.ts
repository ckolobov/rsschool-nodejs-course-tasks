import http from 'node:http';
import { validate } from 'uuid';
import { sharedUserDatabase } from '../database/sharedUserDatabase.js';

interface DeleteUserParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
  userId: string;
}

export const deleteUser = async ({ res, userId }: DeleteUserParams) => {
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'Invalid user ID (must be a valid UUID)' }));
    return;
  }

  const deleted = await sharedUserDatabase.delete(userId);

  if (!deleted) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.statusCode = 204;
  res.end();
};
