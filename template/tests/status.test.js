process.env.NODE_ENV = 'development';
require('dotenv').config();
const request = require('supertest');
const app = require('./../dist/app');

describe('Status', () => {
  it('Should Resolve', async (done) => {
    const response = await request(app).get('/api/v1/status/');
    expect(response.statusCode).toBe(200);
    done();
  });
});
