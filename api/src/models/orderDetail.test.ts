import { describe, it, expect } from 'vitest';
import type { OrderDetail } from './orderDetail';

describe('OrderDetail model', () => {
  it('should create a valid order detail object with all fields', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 5,
      productId: 10,
      quantity: 25,
      unitPrice: 14.99,
      notes: 'Urgent delivery required',
    };

    expect(orderDetail.orderDetailId).toBe(1);
    expect(orderDetail.orderId).toBe(5);
    expect(orderDetail.productId).toBe(10);
    expect(orderDetail.quantity).toBe(25);
    expect(orderDetail.unitPrice).toBe(14.99);
    expect(orderDetail.notes).toBe('Urgent delivery required');
  });

  it('should create an order detail with empty notes', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 2,
      orderId: 1,
      productId: 1,
      quantity: 10,
      unitPrice: 9.99,
      notes: '',
    };

    expect(orderDetail.notes).toBe('');
  });

  it('should have numeric ID fields', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 100,
      orderId: 50,
      productId: 25,
      quantity: 1,
      unitPrice: 1.0,
      notes: '',
    };

    expect(typeof orderDetail.orderDetailId).toBe('number');
    expect(typeof orderDetail.orderId).toBe('number');
    expect(typeof orderDetail.productId).toBe('number');
  });

  it('should have numeric quantity and unitPrice', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 100,
      unitPrice: 0.99,
      notes: '',
    };

    expect(typeof orderDetail.quantity).toBe('number');
    expect(typeof orderDetail.unitPrice).toBe('number');
    expect(orderDetail.quantity).toBeGreaterThan(0);
    expect(orderDetail.unitPrice).toBeGreaterThan(0);
  });
});
