const request = require('supertest');
const app = require('../app');

describe('app', () => {
  it('should export the express app correctly', () => {
    expect(app).toBeTruthy();
  });

  describe('GET /', () => {
    it('should respond to the GET method with 200', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /docs/', () => {
    it('should serve Swagger UI documentation with 200 OK', async () => {
      const response = await request(app).get('/api-docs/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Swagger UI');
    });
  });

  describe('GET /404', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async () => {
      const response = await request(app).get('/404');
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async () => {
      const response = await request(app).post('/404');
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
