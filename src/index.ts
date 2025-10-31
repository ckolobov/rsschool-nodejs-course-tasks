import http from 'node:http';
import { createNewUser } from './actions/createNewUser.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Set default headers
  res.setHeader('Content-Type', 'application/json');

  // POST /api/users - Create new user
  if (method === 'POST' && url === '/api/users') {
    await createNewUser({ req, res });
    return;
  }

  // Handle 404
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
