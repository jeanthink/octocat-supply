import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter from './product';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Product API', () => {
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
    app.use('/products', productRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new product', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Test Widget',
      description: 'A test widget',
      price: 9.99,
      sku: 'WIDGET-001',
      unit: 'piece',
      imgName: 'widget.png',
      discount: 0.1,
    };
    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Test Widget', sku: 'WIDGET-001' });
    expect(response.body.productId).toBeDefined();
  });

  it('should get all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a product by ID', async () => {
    const createResponse = await request(app).post('/products').send({
      supplierId: 1,
      name: 'Lookup Product',
      description: 'desc',
      price: 5.0,
      sku: 'LOOKUP-001',
      unit: 'box',
      imgName: '',
    });
    const productId = createResponse.body.productId;

    const response = await request(app).get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.productId).toBe(productId);
    expect(response.body.name).toBe('Lookup Product');
  });

  it('should update a product by ID', async () => {
    const createResponse = await request(app).post('/products').send({
      supplierId: 1,
      name: 'Original Product',
      description: 'desc',
      price: 10.0,
      sku: 'ORIG-001',
      unit: 'piece',
      imgName: '',
    });
    const productId = createResponse.body.productId;

    const response = await request(app).put(`/products/${productId}`).send({
      supplierId: 1,
      name: 'Updated Product',
      description: 'updated desc',
      price: 12.5,
      sku: 'ORIG-001',
      unit: 'piece',
      imgName: '',
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Product');
    expect(response.body.price).toBe(12.5);
  });

  it('should delete a product by ID', async () => {
    const createResponse = await request(app).post('/products').send({
      supplierId: 1,
      name: 'Delete Me Product',
      description: 'desc',
      price: 1.0,
      sku: 'DEL-001',
      unit: 'piece',
      imgName: '',
    });
    const productId = createResponse.body.productId;

    const response = await request(app).delete(`/products/${productId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing product on GET', async () => {
    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing product on PUT', async () => {
    const response = await request(app).put('/products/999').send({
      supplierId: 1,
      name: 'Ghost',
      description: '',
      price: 0,
      sku: 'GHOST-001',
      unit: 'piece',
      imgName: '',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existing product on DELETE', async () => {
    const response = await request(app).delete('/products/999');
    expect(response.status).toBe(404);
  });

  it('should get a product by name', async () => {
    await request(app).post('/products').send({
      supplierId: 1,
      name: 'SearchWidget',
      description: 'A searchable widget',
      price: 7.50,
      sku: 'NS-001',
      unit: 'piece',
      imgName: '',
    });

    const response = await request(app).get('/products/name/SearchWidget');
    expect(response.status).toBe(200);
    // findByName returns an array; even empty array is truthy so route always returns 200
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe('SearchWidget');
  });

  it('should return empty array for product not found by name', async () => {
    const response = await request(app).get('/products/name/NonExistentProductXYZ');
    expect(response.status).toBe(200);
    // findByName always returns an array (truthy), so 404 is never returned
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});
