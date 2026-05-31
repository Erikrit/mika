import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('F01 — Smoke Test', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'erik@mika.local', password: 'mika@dev2026' });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health/ping');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /life-areas returns 5 areas', async () => {
    const res = await request(app.getHttpServer())
      .get('/life-areas')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
  });

  it('POST /tasks creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Tarefa de teste E2E', priority: 2, contextTags: [] });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Tarefa de teste E2E');
  });

  it('GET /dashboard/today returns data', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/today')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('events');
    expect(res.body).toHaveProperty('overdueTasks');
  });
});
