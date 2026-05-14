import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderRouter from './order';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Order API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys: headquarters -> branch
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'Test HQ']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Test Branch'],
    );

    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new order', async () => {
    const newOrder = {
      branchId: 1,
      orderDate: '2025-01-15',
      name: 'January Order',
      description: 'Monthly supply order',
      status: 'pending',
    };
    const response = await request(app).post('/orders').send(newOrder);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'January Order', status: 'pending' });
    expect(response.body.orderId).toBeDefined();
  });

  it('should get all orders', async () => {
    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get all orders when orders exist', async () => {
    // Create an order first so the non-linear pattern code path is hit
    await request(app).post('/orders').send({
      branchId: 1,
      orderDate: '2025-01-01',
      name: 'Seeded Order',
      description: 'desc',
      status: 'pending',
    });

    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get an order by ID', async () => {
    const createResponse = await request(app).post('/orders').send({
      branchId: 1,
      orderDate: '2025-02-01',
      name: 'Lookup Order',
      description: 'desc',
      status: 'pending',
    });
    const orderId = createResponse.body.orderId;

    const response = await request(app).get(`/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.body.orderId).toBe(orderId);
    expect(response.body.name).toBe('Lookup Order');
  });

  it('should update an order by ID', async () => {
    const createResponse = await request(app).post('/orders').send({
      branchId: 1,
      orderDate: '2025-03-01',
      name: 'Original Order',
      description: 'desc',
      status: 'pending',
    });
    const orderId = createResponse.body.orderId;

    const response = await request(app).put(`/orders/${orderId}`).send({
      branchId: 1,
      orderDate: '2025-03-01',
      name: 'Updated Order',
      description: 'updated desc',
      status: 'processing',
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Order');
    expect(response.body.status).toBe('processing');
  });

  it('should delete an order by ID', async () => {
    const createResponse = await request(app).post('/orders').send({
      branchId: 1,
      orderDate: '2025-04-01',
      name: 'Delete Me Order',
      description: 'desc',
      status: 'pending',
    });
    const orderId = createResponse.body.orderId;

    const response = await request(app).delete(`/orders/${orderId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing order on GET', async () => {
    const response = await request(app).get('/orders/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing order on PUT', async () => {
    const response = await request(app).put('/orders/999').send({
      branchId: 1,
      orderDate: '2025-01-01',
      name: 'Ghost Order',
      description: '',
      status: 'pending',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing order on DELETE', async () => {
    const response = await request(app).delete('/orders/999');
    expect(response.status).toBe(404);
  });
});
