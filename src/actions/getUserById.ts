import http from 'node:http';
import { validate } from 'uuid';
import { sharedUserDatabase } from '../database/sharedUserDatabase.js';

interface GetUserByIdParams {
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
  userId: string;
}

export const getUserById = async ({ res, userId }: GetUserByIdParams) => {
  try {
    if (!validate(userId)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Invalid user ID (must be a valid UUID)' }));
      return;
    }

    const user = await sharedUserDatabase.getUser(userId);

    if (!user) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(user));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
    );
  }
};
