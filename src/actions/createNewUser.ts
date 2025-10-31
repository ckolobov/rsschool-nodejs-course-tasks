import http from 'node:http';
import { userDatabase } from '../database/userDatabase.js';
import { validateCreateUserDto } from '../validation/userDataValidation.js';
import { parseJsonBody } from '../helpers/parseJsonBody.js';

interface CreateNewUserParams {
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  }
}

export const createNewUser = async ({req, res}: CreateNewUserParams) => {
  try {
    const body = await parseJsonBody(req);

    if (!validateCreateUserDto(body)) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: 'Request body must contain required fields: username (string), age (number), hobbies (array of strings)',
        }),
      );
      return;
    }

    const newUser = userDatabase.create(body);
    res.statusCode = 201;
    res.end(JSON.stringify(newUser));
  } catch (error) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Invalid request body',
      }),
    );
  }
}
