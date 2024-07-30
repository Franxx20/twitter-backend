import supertest from 'supertest';
import { app, httpServer } from '@server';

describe('health', () => {
  afterAll((done) => {
    httpServer.close();
    done();
  });

  it('should return 200 OK', async () => {
    const response = await supertest(app).get('/api/health').send();
    expect(response.status).toBe(200);
  });
});
