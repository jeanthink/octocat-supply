import { describe, it, expect } from 'vitest';
import type { Product } from './product';

describe('Product model', () => {
  it('should create a valid product object with all fields', () => {
    const product: Product = {
      productId: 1,
      supplierId: 2,
      name: 'Industrial Gear',
      description: 'Heavy-duty industrial gear',
      price: 49.99,
      sku: 'GEAR-IND-001',
      unit: 'piece',
      imgName: 'gear.png',
      discount: 0.15,
    };

    expect(product.productId).toBe(1);
    expect(product.supplierId).toBe(2);
    expect(product.name).toBe('Industrial Gear');
    expect(product.description).toBe('Heavy-duty industrial gear');
    expect(product.price).toBe(49.99);
    expect(product.sku).toBe('GEAR-IND-001');
    expect(product.unit).toBe('piece');
    expect(product.imgName).toBe('gear.png');
    expect(product.discount).toBe(0.15);
  });

  it('should create a product without optional discount', () => {
    const product: Product = {
      productId: 2,
      supplierId: 1,
      name: 'Basic Widget',
      description: '',
      price: 5.0,
      sku: 'WIDGET-001',
      unit: 'box',
      imgName: '',
    };

    expect(product.productId).toBe(2);
    expect(product.discount).toBeUndefined();
  });

  it('should have numeric price and supplierId', () => {
    const product: Product = {
      productId: 3,
      supplierId: 5,
      name: 'Numeric Test',
      description: '',
      price: 99.0,
      sku: 'NUM-001',
      unit: 'kg',
      imgName: '',
    };

    expect(typeof product.price).toBe('number');
    expect(typeof product.supplierId).toBe('number');
    expect(typeof product.productId).toBe('number');
  });

  it('should support discount as a decimal value', () => {
    const product: Product = {
      productId: 4,
      supplierId: 1,
      name: 'Discounted Item',
      description: '',
      price: 20.0,
      sku: 'DISC-001',
      unit: 'piece',
      imgName: '',
      discount: 0.25,
    };

    expect(product.discount).toBe(0.25);
    expect(product.discount).toBeGreaterThan(0);
    expect(product.discount).toBeLessThan(1);
  });
});
