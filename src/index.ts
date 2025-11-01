import 'dotenv/config';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT) || 3000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
