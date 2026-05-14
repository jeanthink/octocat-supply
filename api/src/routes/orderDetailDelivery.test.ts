import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderDetailDeliveryRouter from './orderDetailDelivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('OrderDetailDelivery API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed full chain for order_detail and delivery foreign keys
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'Test HQ']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Test Branch'],
    );
    await db.run(
      'INSERT INTO orders (order_id, branch_id, order_date, name, status) VALUES (?, ?, ?, ?, ?)',
      [1, 1, '2025-01-01', 'Test Order', 'pending'],
    );
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 9.99, 'SKU-001', 'piece'],
    );
    await db.run(
      'INSERT INTO order_details (order_detail_id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
      [1, 1, 1, 5, 9.99],
    );
    await db.run(
      'INSERT INTO deliveries (delivery_id, supplier_id, delivery_date, name, status) VALUES (?, ?, ?, ?, ?)',
      [1, 1, '2025-01-01', 'Test Delivery', 'pending'],
    );

    app = express();
    app.use(express.json());
    app.use('/order-detail-deliveries', orderDetailDeliveryRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new order detail delivery', async () => {
    const newODD = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'First partial delivery',
    };
    const response = await request(app).post('/order-detail-deliveries').send(newODD);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ orderDetailId: 1, deliveryId: 1, quantity: 3 });
    expect(response.body.orderDetailDeliveryId).toBeDefined();
  });

  it('should get all order detail deliveries', async () => {
    const response = await request(app).get('/order-detail-deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get an order detail delivery by ID', async () => {
    const createResponse = await request(app).post('/order-detail-deliveries').send({
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 2,
      notes: '',
    });
    const oddId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).get(`/order-detail-deliveries/${oddId}`);
    expect(response.status).toBe(200);
    expect(response.body.orderDetailDeliveryId).toBe(oddId);
    expect(response.body.quantity).toBe(2);
  });

  it('should update an order detail delivery by ID', async () => {
    const createResponse = await request(app).post('/order-detail-deliveries').send({
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 1,
      notes: '',
    });
    const oddId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).put(`/order-detail-deliveries/${oddId}`).send({
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 4,
      notes: 'Increased quantity',
    });
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(4);
    expect(response.body.notes).toBe('Increased quantity');
  });

  it('should delete an order detail delivery by ID', async () => {
    const createResponse = await request(app).post('/order-detail-deliveries').send({
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 5,
      notes: '',
    });
    const oddId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).delete(`/order-detail-deliveries/${oddId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing order detail delivery on GET', async () => {
    const response = await request(app).get('/order-detail-deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing order detail delivery on PUT', async () => {
    const response = await request(app).put('/order-detail-deliveries/999').send({
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 1,
      notes: '',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing order detail delivery on DELETE', async () => {
    const response = await request(app).delete('/order-detail-deliveries/999');
    expect(response.status).toBe(404);
  });
});
