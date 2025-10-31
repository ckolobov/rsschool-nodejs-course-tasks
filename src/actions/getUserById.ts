import http from 'node:http';
import { validate } from 'uuid';
import { userDatabase } from '../database/userDatabase.js';

interface GetUserByIdParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
  userId: string;
}

export const getUserById = async ({ res, userId }: GetUserByIdParams) => {
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'Invalid user ID (must be a valid UUID)' }));
    return;
  }

  const user = userDatabase.getUser(userId);

  if (!user) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify(user));
};
