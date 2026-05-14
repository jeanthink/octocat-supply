import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import deliveryRouter from './delivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Delivery API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier id 1
    const db = await getDatabase();
    await db.run(
      'INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)',
      [1, 'Test Supplier'],
    );

    app = express();
    app.use(express.json());
    app.use('/deliveries', deliveryRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new delivery', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-06-01',
      name: 'June Delivery',
      description: 'Monthly stock delivery',
      status: 'pending',
    };
    const response = await request(app).post('/deliveries').send(newDelivery);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'June Delivery', status: 'pending' });
    expect(response.body.deliveryId).toBeDefined();
  });

  it('should get all deliveries', async () => {
    const response = await request(app).get('/deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a delivery by ID', async () => {
    const createResponse = await request(app).post('/deliveries').send({
      supplierId: 1,
      deliveryDate: '2025-07-01',
      name: 'Lookup Delivery',
      description: 'desc',
      status: 'pending',
    });
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).get(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(200);
    expect(response.body.deliveryId).toBe(deliveryId);
    expect(response.body.name).toBe('Lookup Delivery');
  });

  it('should update a delivery by ID', async () => {
    const createResponse = await request(app).post('/deliveries').send({
      supplierId: 1,
      deliveryDate: '2025-08-01',
      name: 'Original Delivery',
      description: 'desc',
      status: 'pending',
    });
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).put(`/deliveries/${deliveryId}`).send({
      supplierId: 1,
      deliveryDate: '2025-08-15',
      name: 'Updated Delivery',
      description: 'updated desc',
      status: 'in-transit',
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Delivery');
    expect(response.body.status).toBe('in-transit');
  });

  it('should delete a delivery by ID', async () => {
    const createResponse = await request(app).post('/deliveries').send({
      supplierId: 1,
      deliveryDate: '2025-09-01',
      name: 'Delete Me Delivery',
      description: 'desc',
      status: 'pending',
    });
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).delete(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(204);
  });

  it('should update delivery status', async () => {
    const createResponse = await request(app).post('/deliveries').send({
      supplierId: 1,
      deliveryDate: '2025-10-01',
      name: 'Status Delivery',
      description: 'desc',
      status: 'pending',
    });
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app)
      .put(`/deliveries/${deliveryId}/status`)
      .send({ status: 'delivered' });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('delivered');
  });

  it('should return 404 for non-existing delivery on GET', async () => {
    const response = await request(app).get('/deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing delivery on PUT', async () => {
    const response = await request(app).put('/deliveries/999').send({
      supplierId: 1,
      deliveryDate: '2025-01-01',
      name: 'Ghost',
      description: '',
      status: 'pending',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing delivery on DELETE', async () => {
    const response = await request(app).delete('/deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating status of non-existing delivery', async () => {
    const response = await request(app)
      .put('/deliveries/999/status')
      .send({ status: 'delivered' });
    expect(response.status).toBe(404);
  });

  it('should return 500 when updating status with an invalid delivery partner command', async () => {
    const createResponse = await request(app).post('/deliveries').send({
      supplierId: 1,
      deliveryDate: '2025-11-01',
      name: 'Partner Delivery',
      description: 'desc',
      status: 'pending',
    });
    const deliveryId = createResponse.body.deliveryId;

    // deliveryPartner triggers exec('notify <partner>') which fails since notify is not installed
    const response = await request(app)
      .put(`/deliveries/${deliveryId}/status`)
      .send({ status: 'delivered', deliveryPartner: 'test-partner' });
    expect(response.status).toBe(500);
  });
});
