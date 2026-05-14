import { describe, it, expect } from 'vitest';
import type { Order } from './order';

describe('Order model', () => {
  it('should create a valid order object with all fields', () => {
    const order: Order = {
      orderId: 1,
      branchId: 3,
      orderDate: '2025-03-15T10:00:00Z',
      name: 'Q1 Supply Order',
      description: 'First quarter supplies',
      status: 'pending',
    };

    expect(order.orderId).toBe(1);
    expect(order.branchId).toBe(3);
    expect(order.orderDate).toBe('2025-03-15T10:00:00Z');
    expect(order.name).toBe('Q1 Supply Order');
    expect(order.description).toBe('First quarter supplies');
    expect(order.status).toBe('pending');
  });

  it('should support different order status values', () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    statuses.forEach((status) => {
      const order: Order = {
        orderId: 1,
        branchId: 1,
        orderDate: '2025-01-01',
        name: `${status} order`,
        description: '',
        status,
      };
      expect(order.status).toBe(status);
    });
  });

  it('should have numeric orderId and branchId', () => {
    const order: Order = {
      orderId: 42,
      branchId: 7,
      orderDate: '2025-05-01',
      name: 'Numeric Order',
      description: '',
      status: 'pending',
    };

    expect(typeof order.orderId).toBe('number');
    expect(typeof order.branchId).toBe('number');
  });

  it('should have string orderDate', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2025-12-31',
      name: 'Year End Order',
      description: '',
      status: 'pending',
    };

    expect(typeof order.orderDate).toBe('string');
  });
});
