import 'dotenv/config';
import http from 'node:http';
import { createNewUser } from './actions/createNewUser.js';
import { getAllUsers } from './actions/getAllUsers.js';
import { getUserById } from './actions/getUserById.js';
import { updateUser } from './actions/updateUser.js';
import { deleteUser } from './actions/deleteUser.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Set default headers
  res.setHeader('Content-Type', 'application/json');

  // GET /api/users - Get all users
  if (method === 'GET' && url === '/api/users') {
    await getAllUsers({ res });
    return;
  }

  // GET /api/users/{userId} - Get user by ID
  if (method === 'GET' && url?.startsWith('/api/users/')) {
    const userId = url.split('/')[3];
    await getUserById({ res, userId });
    return;
  }

  // POST /api/users - Create new user
  if (method === 'POST' && url === '/api/users') {
    await createNewUser({ req, res });
    return;
  }

  // PUT /api/users/{userId} - Update user by ID
  if (method === 'PUT' && url?.startsWith('/api/users/')) {
    const userId = url.split('/')[3];
    await updateUser({ req, res, userId });
    return;
  }

  // DELETE /api/users/{userId} - Delete user by ID
  if (method === 'DELETE' && url?.startsWith('/api/users/')) {
    const userId = url.split('/')[3];
    await deleteUser({ res, userId });
    return;
  }

  // Handle 404
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
