import { describe, it, expect } from 'vitest';
import type { OrderDetailDelivery } from './orderDetailDelivery';

describe('OrderDetailDelivery model', () => {
  it('should create a valid order detail delivery object with all fields', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 5,
      deliveryId: 3,
      quantity: 10,
      notes: 'Partial shipment',
    };

    expect(odd.orderDetailDeliveryId).toBe(1);
    expect(odd.orderDetailId).toBe(5);
    expect(odd.deliveryId).toBe(3);
    expect(odd.quantity).toBe(10);
    expect(odd.notes).toBe('Partial shipment');
  });

  it('should create an order detail delivery with empty notes', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 2,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 5,
      notes: '',
    };

    expect(odd.notes).toBe('');
  });

  it('should have numeric ID fields', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 99,
      orderDetailId: 10,
      deliveryId: 20,
      quantity: 1,
      notes: '',
    };

    expect(typeof odd.orderDetailDeliveryId).toBe('number');
    expect(typeof odd.orderDetailId).toBe('number');
    expect(typeof odd.deliveryId).toBe('number');
  });

  it('should have numeric quantity', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 50,
      notes: '',
    };

    expect(typeof odd.quantity).toBe('number');
    expect(odd.quantity).toBeGreaterThan(0);
  });
});
