import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailDeliveriesRepository } from './orderDetailDeliveriesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('OrderDetailDeliveriesRepository', () => {
    let repository: OrderDetailDeliveriesRepository;
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            db: {} as any,
            run: vi.fn(),
            get: vi.fn(),
            all: vi.fn(),
            close: vi.fn()
        };
        (getDatabase as any).mockResolvedValue(mockDb);
        repository = new OrderDetailDeliveriesRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all order detail deliveries', async () => {
            const mockResults = [
                { order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1, quantity: 3, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].orderDetailDeliveryId).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return order detail delivery when found', async () => {
            mockDb.get.mockResolvedValue({ order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1, quantity: 3, notes: '' });
            const result = await repository.findById(1);
            expect(result?.orderDetailDeliveryId).toBe(1);
        });

        it('should return null when not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new order detail delivery', async () => {
            const newODD = { orderDetailId: 1, deliveryId: 1, quantity: 2, notes: '' };
            mockDb.run.mockResolvedValue({ lastID: 4, changes: 1 });
            mockDb.get.mockResolvedValue({ order_detail_delivery_id: 4, order_detail_id: 1, delivery_id: 1, quantity: 2, notes: '' });
            const result = await repository.create(newODD);
            expect(result.orderDetailDeliveryId).toBe(4);
        });
    });

    describe('update', () => {
        it('should update and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1, quantity: 7, notes: 'updated' });
            const result = await repository.update(1, { quantity: 7 });
            expect(result.quantity).toBe(7);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { quantity: 1 })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete existing order detail delivery', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM order_detail_deliveries WHERE order_detail_delivery_id = ?', [1]);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });

    describe('findByOrderDetailId', () => {
        it('should return deliveries for an order detail', async () => {
            const mockResults = [
                { order_detail_delivery_id: 1, order_detail_id: 5, delivery_id: 2, quantity: 3, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByOrderDetailId(5);
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_detail_deliveries WHERE order_detail_id = ? ORDER BY order_detail_delivery_id',
                [5]
            );
            expect(result).toHaveLength(1);
            expect(result[0].orderDetailId).toBe(5);
        });
    });

    describe('findByDeliveryId', () => {
        it('should return order details for a delivery', async () => {
            const mockResults = [
                { order_detail_delivery_id: 2, order_detail_id: 1, delivery_id: 9, quantity: 2, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByDeliveryId(9);
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_detail_deliveries WHERE delivery_id = ? ORDER BY order_detail_delivery_id',
                [9]
            );
            expect(result).toHaveLength(1);
            expect(result[0].deliveryId).toBe(9);
        });
    });

    describe('getTotalQuantityByOrderDetailId', () => {
        it('should return total quantity for an order detail', async () => {
            mockDb.get.mockResolvedValue({ total: 15 });
            const result = await repository.getTotalQuantityByOrderDetailId(1);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT SUM(quantity) as total FROM order_detail_deliveries WHERE order_detail_id = ?',
                [1]
            );
            expect(result).toBe(15);
        });

        it('should return 0 when no deliveries for order detail', async () => {
            mockDb.get.mockResolvedValue({ total: null });
            const result = await repository.getTotalQuantityByOrderDetailId(999);
            expect(result).toBe(0);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.getTotalQuantityByOrderDetailId(1)).rejects.toThrow();
        });
    });

    describe('findByOrderDetailId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByOrderDetailId(1)).rejects.toThrow();
        });
    });

    describe('findByDeliveryId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByDeliveryId(1)).rejects.toThrow();
        });
    });
});
