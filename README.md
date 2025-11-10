# User Management CRUD API

A Node.js RESTful API for managing user data with support for horizontal scaling using Node.js cluster module. Built with TypeScript and native Node.js HTTP server.

## Features

- RESTful CRUD operations for user management
- Built with TypeScript and native Node.js HTTP server (no external frameworks)
- Three operational modes: development, production, and multi-process (horizontal scaling)
- Round-robin load balancing for multi-process mode
- In-memory database with IPC synchronization across workers
- Input validation for user data
- Comprehensive test suite with Jest
- Code quality tools: ESLint and Prettier

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18.x or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ckolobov/rsschool-nodejs-course-tasks.git
cd rsschool-nodejs-course-tasks
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the root directory to configure the port:
```bash
PORT=3000
```
If not specified, the server will default to port 3000.

## Running the Application

The application supports three different modes:

### Development Mode

Runs the application with hot-reloading using nodemon. The server automatically restarts when you make changes to source files.

```bash
npm run start:dev
```

The server will be available at `http://localhost:3000` (or your configured PORT).

### Production Mode

Compiles TypeScript to JavaScript and runs the compiled code for optimal performance.

```bash
npm run start:prod
```

This command will:
1. Compile TypeScript files to the `dist/` directory
2. Start the server using compiled JavaScript

### Multi-Process Mode (Horizontal Scaling)

Runs the application with horizontal scaling using Node.js cluster module. This mode creates multiple worker processes and a load balancer.

```bash
npm run start:multi
```

This mode will:
- Create N-1 worker processes (where N is the number of CPU cores)
- Start a load balancer on the main port (default: 3000)
- Start each worker on sequential ports (3001, 3002, etc.)
- Distribute requests across workers using round-robin algorithm
- Synchronize the in-memory database across all workers using IPC

Example output:
```
Primary process 12345 is running
Starting 3 workers...
Load balancer listening on http://localhost:3000
Workers running on ports 3001 to 3003
```

## Testing

Run the test suite:
```bash
npm test
```

The project includes comprehensive API tests using Jest and Supertest.

## Development

### Building the Project

Compile TypeScript to JavaScript:
```bash
npm run build
```

Compiled files will be output to the `dist/` directory.

### Code Quality

#### Linting

Check for linting issues:
```bash
npm run lint
```

Automatically fix linting issues:
```bash
npm run lint:fix
```

#### Formatting

Check code formatting:
```bash
npm run format
```

Automatically format code:
```bash
npm run format:fix
```

## Project Structure

```
rsschool-nodejs-course-tasks/
├── src/
│   ├── __tests__/
│   │   └── api.test.ts          # API integration tests
│   ├── actions/
│   │   ├── createNewUser.ts     # Create user handler
│   │   ├── deleteUser.ts        # Delete user handler
│   │   ├── getAllUsers.ts       # Get all users handler
│   │   ├── getUserById.ts       # Get user by ID handler
│   │   └── updateUser.ts        # Update user handler
│   ├── database/
│   │   ├── userDatabase.ts      # In-memory database implementation
│   │   └── sharedUserDatabase.ts # Shared database for multi-process mode
│   ├── helpers/
│   │   └── parseJsonBody.ts     # JSON body parser utility
│   ├── types/
│   │   └── user.ts              # User type definitions
│   ├── validation/
│   │   └── userDataValidation.ts # User data validation logic
│   ├── cluster.ts               # Multi-process mode entry point
│   ├── index.ts                 # Main application entry point
│   └── server.ts                # HTTP server setup
├── dist/                         # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Node.js HTTP Module** - Native HTTP server
- **Node.js Cluster Module** - Multi-process support
- **UUID** - Unique identifier generation
- **dotenv** - Environment variable management
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **ESLint** - Code linting
- **Prettier** - Code formatting

## License

ISC

## Repository

[https://github.com/ckolobov/rsschool-nodejs-course-tasks](https://github.com/ckolobov/rsschool-nodejs-course-tasks)