import http from 'node:http';
import { validate } from 'uuid';
import { userDatabase } from '../database/userDatabase.js';
import { parseJsonBody } from '../helpers/parseJsonBody.js';
import { validateUpdateUserDto } from '../validation/userDataValidation.js';

interface UpdateUserParams {
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
  userId: string;
}

export const updateUser = async ({ req, res, userId }: UpdateUserParams) => {
  if (!validate(userId)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'Invalid user ID (must be a valid UUID)' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);

    if (!validateUpdateUserDto(body)) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message:
            'Request body must contain at least one valid field: username (string), age (number), or hobbies (array of strings)',
        }),
      );
      return;
    }

    const updatedUser = userDatabase.update(userId, body);

    if (!updatedUser) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(updatedUser));
  } catch (error) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Invalid request body',
      }),
    );
  }
};
