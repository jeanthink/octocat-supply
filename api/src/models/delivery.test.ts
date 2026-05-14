import { describe, it, expect } from 'vitest';
import type { Delivery } from './delivery';

describe('Delivery model', () => {
  it('should create a valid delivery object with all fields', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 3,
      deliveryDate: '2025-06-15',
      name: 'Summer Delivery',
      description: 'Bulk summer stock',
      status: 'pending',
    };

    expect(delivery.deliveryId).toBe(1);
    expect(delivery.supplierId).toBe(3);
    expect(delivery.deliveryDate).toBe('2025-06-15');
    expect(delivery.name).toBe('Summer Delivery');
    expect(delivery.description).toBe('Bulk summer stock');
    expect(delivery.status).toBe('pending');
  });

  it('should support different status values', () => {
    const statuses = ['pending', 'in-transit', 'delivered', 'cancelled'];

    statuses.forEach((status) => {
      const delivery: Delivery = {
        deliveryId: 1,
        supplierId: 1,
        deliveryDate: '2025-01-01',
        name: `${status} delivery`,
        description: '',
        status,
      };
      expect(delivery.status).toBe(status);
    });
  });

  it('should have numeric deliveryId and supplierId', () => {
    const delivery: Delivery = {
      deliveryId: 100,
      supplierId: 50,
      deliveryDate: '2025-03-01',
      name: 'Numeric Test',
      description: '',
      status: 'pending',
    };

    expect(typeof delivery.deliveryId).toBe('number');
    expect(typeof delivery.supplierId).toBe('number');
  });

  it('should have string deliveryDate', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2025-12-31',
      name: 'Year End',
      description: '',
      status: 'pending',
    };

    expect(typeof delivery.deliveryDate).toBe('string');
  });
});
