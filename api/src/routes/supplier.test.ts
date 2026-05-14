import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter from './supplier';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Supplier API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'Test Supplier',
      description: 'A test supplier',
      contactPerson: 'Jane Smith',
      email: 'jane@supplier.com',
      phone: '555-1001',
      active: true,
      verified: false,
    };
    const response = await request(app).post('/suppliers').send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Test Supplier' });
    expect(response.body.supplierId).toBeDefined();
  });

  it('should get all suppliers', async () => {
    const response = await request(app).get('/suppliers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a supplier by ID', async () => {
    const createResponse = await request(app).post('/suppliers').send({
      name: 'Lookup Supplier',
      description: 'desc',
      contactPerson: 'Bob',
      email: 'bob@test.com',
      phone: '555-1002',
      active: true,
      verified: true,
    });
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
    expect(response.body.name).toBe('Lookup Supplier');
  });

  it('should update a supplier by ID', async () => {
    const createResponse = await request(app).post('/suppliers').send({
      name: 'Original Supplier',
      description: 'desc',
      contactPerson: 'Alice',
      email: 'alice@test.com',
      phone: '555-1003',
      active: true,
      verified: false,
    });
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).put(`/suppliers/${supplierId}`).send({
      name: 'Updated Supplier',
      description: 'updated desc',
      contactPerson: 'Alice Updated',
      email: 'alice@test.com',
      phone: '555-1003',
      active: true,
      verified: true,
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Supplier');
  });

  it('should delete a supplier by ID', async () => {
    const createResponse = await request(app).post('/suppliers').send({
      name: 'Delete Me Supplier',
      description: 'desc',
      contactPerson: 'Del',
      email: 'del@test.com',
      phone: '555-9999',
      active: false,
      verified: false,
    });
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing supplier on GET', async () => {
    const response = await request(app).get('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing supplier on PUT', async () => {
    const response = await request(app).put('/suppliers/999').send({
      name: 'Ghost',
      description: 'desc',
      contactPerson: 'Nobody',
      email: 'nobody@test.com',
      phone: '555-0000',
      active: false,
      verified: false,
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing supplier on DELETE', async () => {
    const response = await request(app).delete('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should get supplier status by ID', async () => {
    const createResponse = await request(app).post('/suppliers').send({
      name: 'Status Supplier',
      description: 'desc',
      contactPerson: 'Status Person',
      email: 'status@test.com',
      phone: '555-1004',
      active: true,
      verified: true,
    });
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });

  it('should return 404 for status of non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999/status');
    expect(response.status).toBe(404);
  });
});
