import request from 'supertest';
import { createServer } from '../server.js';
import { userDatabase } from '../database/userDatabase.js';

const server = createServer();

describe('User API Tests', () => {
  beforeEach(() => {
    // Clear database before each test
    userDatabase.clear();
  });

  afterAll(() => {
    // Close server after all tests
    server.close();
  });

  describe('Scenario 1: Complete CRUD lifecycle', () => {
    it('should complete full user lifecycle (GET empty, POST, GET by id, PUT, DELETE, GET deleted)', async () => {
      // 1. Get all records - expect empty array
      const getAllResponse1 = await request(server).get('/api/users');
      expect(getAllResponse1.status).toBe(200);
      expect(getAllResponse1.body).toEqual([]);

      // 2. Create a new user
      const newUser = {
        username: 'john_doe',
        age: 30,
        hobbies: ['reading', 'gaming'],
      };
      const createResponse = await request(server)
        .post('/api/users')
        .send(newUser);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toMatchObject(newUser);
      expect(createResponse.body).toHaveProperty('id');
      expect(typeof createResponse.body.id).toBe('string');

      const userId = createResponse.body.id;

      // 3. Get the created user by id
      const getByIdResponse = await request(server).get(`/api/users/${userId}`);
      expect(getByIdResponse.status).toBe(200);
      expect(getByIdResponse.body).toEqual(createResponse.body);

      // 4. Update the user
      const updatedData = {
        username: 'john_updated',
        age: 31,
        hobbies: ['reading', 'gaming', 'cooking'],
      };
      const updateResponse = await request(server)
        .put(`/api/users/${userId}`)
        .send(updatedData);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject(updatedData);
      expect(updateResponse.body.id).toBe(userId);

      // 5. Delete the user
      const deleteResponse = await request(server).delete(`/api/users/${userId}`);
      expect(deleteResponse.status).toBe(204);

      // 6. Try to get deleted user - expect 404
      const getDeletedResponse = await request(server).get(`/api/users/${userId}`);
      expect(getDeletedResponse.status).toBe(404);
      expect(getDeletedResponse.body).toHaveProperty('message');
    });
  });

  describe('Scenario 2: Multiple users management', () => {
    it('should handle multiple users correctly', async () => {
      // Create first user
      const user1 = {
        username: 'alice',
        age: 25,
        hobbies: ['painting', 'yoga'],
      };
      const createResponse1 = await request(server)
        .post('/api/users')
        .send(user1);
      expect(createResponse1.status).toBe(201);

      // Create second user
      const user2 = {
        username: 'bob',
        age: 35,
        hobbies: ['running', 'photography'],
      };
      const createResponse2 = await request(server)
        .post('/api/users')
        .send(user2);
      expect(createResponse2.status).toBe(201);

      // Get all users - should return both
      const getAllResponse = await request(server).get('/api/users');
      expect(getAllResponse.status).toBe(200);
      expect(getAllResponse.body).toHaveLength(2);
      expect(getAllResponse.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ username: 'alice' }),
          expect.objectContaining({ username: 'bob' }),
        ])
      );

      // Delete first user
      await request(server).delete(`/api/users/${createResponse1.body.id}`);

      // Get all users - should return only second user
      const getAllAfterDelete = await request(server).get('/api/users');
      expect(getAllAfterDelete.status).toBe(200);
      expect(getAllAfterDelete.body).toHaveLength(1);
      expect(getAllAfterDelete.body[0].username).toBe('bob');
    });
  });

  describe('Scenario 3: Error handling and validation', () => {
    it('should handle invalid user creation (missing required fields)', async () => {
      // Missing username
      const invalidUser1 = {
        age: 25,
        hobbies: ['reading'],
      };
      const response1 = await request(server)
        .post('/api/users')
        .send(invalidUser1);
      expect(response1.status).toBe(400);
      expect(response1.body).toHaveProperty('message');

      // Missing age
      const invalidUser2 = {
        username: 'test',
        hobbies: ['reading'],
      };
      const response2 = await request(server)
        .post('/api/users')
        .send(invalidUser2);
      expect(response2.status).toBe(400);

      // Missing hobbies
      const invalidUser3 = {
        username: 'test',
        age: 25,
      };
      const response3 = await request(server)
        .post('/api/users')
        .send(invalidUser3);
      expect(response3.status).toBe(400);
    });

    it('should handle invalid user ID (non-existent UUID)', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // GET non-existent user
      const getResponse = await request(server).get(`/api/users/${validUuid}`);
      expect(getResponse.status).toBe(404);

      // UPDATE non-existent user
      const updateResponse = await request(server)
        .put(`/api/users/${validUuid}`)
        .send({ username: 'test', age: 30, hobbies: ['test'] });
      expect(updateResponse.status).toBe(404);

      // DELETE non-existent user
      const deleteResponse = await request(server).delete(`/api/users/${validUuid}`);
      expect(deleteResponse.status).toBe(404);
    });

    it('should handle invalid UUID format', async () => {
      const invalidUuid = 'invalid-uuid-format';

      // GET with invalid UUID
      const getResponse = await request(server).get(`/api/users/${invalidUuid}`);
      expect(getResponse.status).toBe(400);
      expect(getResponse.body).toHaveProperty('message');
      expect(getResponse.body.message).toContain('Invalid user ID');

      // UPDATE with invalid UUID
      const updateResponse = await request(server)
        .put(`/api/users/${invalidUuid}`)
        .send({ username: 'test', age: 30, hobbies: ['test'] });
      expect(updateResponse.status).toBe(400);

      // DELETE with invalid UUID
      const deleteResponse = await request(server).delete(`/api/users/${invalidUuid}`);
      expect(deleteResponse.status).toBe(400);
    });

    it('should handle invalid update data', async () => {
      // Create a user first
      const user = {
        username: 'test_user',
        age: 28,
        hobbies: ['cycling'],
      };
      const createResponse = await request(server)
        .post('/api/users')
        .send(user);
      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.id;

      // Try to update with invalid age (string instead of number)
      const invalidUpdate = {
        username: 'updated',
        age: 'not-a-number',
        hobbies: ['cycling'],
      };
      const updateResponse = await request(server)
        .put(`/api/users/${userId}`)
        .send(invalidUpdate);
      expect(updateResponse.status).toBe(400);
    });

    it('should handle malformed JSON in POST request', async () => {
      const response = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');
      expect(response.status).toBe(400);
    });
  });

  describe('Scenario 4: Edge cases', () => {
    it('should handle user with empty hobbies array', async () => {
      const user = {
        username: 'no_hobbies',
        age: 22,
        hobbies: [],
      };
      const createResponse = await request(server)
        .post('/api/users')
        .send(user);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.hobbies).toEqual([]);
    });

    it('should handle partial update (only some fields)', async () => {
      // Create a user
      const user = {
        username: 'original_name',
        age: 30,
        hobbies: ['reading'],
      };
      const createResponse = await request(server)
        .post('/api/users')
        .send(user);
      const userId = createResponse.body.id;

      // Update only username
      const partialUpdate = {
        username: 'updated_name',
      };
      const updateResponse = await request(server)
        .put(`/api/users/${userId}`)
        .send(partialUpdate);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.username).toBe('updated_name');
      expect(updateResponse.body.age).toBe(30);
      expect(updateResponse.body.hobbies).toEqual(['reading']);
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(server).get('/api/invalid-route');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Not Found');
    });
  });
});
