import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailsRepository } from './orderDetailsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('OrderDetailsRepository', () => {
    let repository: OrderDetailsRepository;
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
        repository = new OrderDetailsRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all order details', async () => {
            const mockResults = [
                { order_detail_id: 1, order_id: 1, product_id: 2, quantity: 5, unit_price: 9.99, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].orderDetailId).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return order detail when found', async () => {
            mockDb.get.mockResolvedValue({ order_detail_id: 1, order_id: 1, product_id: 2, quantity: 5, unit_price: 9.99, notes: '' });
            const result = await repository.findById(1);
            expect(result?.orderDetailId).toBe(1);
        });

        it('should return null when order detail not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new order detail and return it', async () => {
            const newDetail = { orderId: 1, productId: 2, quantity: 3, unitPrice: 9.99, notes: '' };
            mockDb.run.mockResolvedValue({ lastID: 5, changes: 1 });
            mockDb.get.mockResolvedValue({ order_detail_id: 5, order_id: 1, product_id: 2, quantity: 3, unit_price: 9.99, notes: '' });
            const result = await repository.create(newDetail);
            expect(result.orderDetailId).toBe(5);
        });
    });

    describe('update', () => {
        it('should update order detail and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ order_detail_id: 1, order_id: 1, product_id: 2, quantity: 10, unit_price: 9.99, notes: 'updated' });
            const result = await repository.update(1, { quantity: 10 });
            expect(result.quantity).toBe(10);
        });

        it('should throw NotFoundError when order detail does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { quantity: 1 })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete existing order detail', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM order_details WHERE order_detail_id = ?', [1]);
        });

        it('should throw NotFoundError when order detail does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when order detail exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when order detail does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });

    describe('findByOrderId', () => {
        it('should return order details for an order', async () => {
            const mockResults = [
                { order_detail_id: 1, order_id: 7, product_id: 2, quantity: 3, unit_price: 9.99, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByOrderId(7);
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_details WHERE order_id = ? ORDER BY order_detail_id',
                [7]
            );
            expect(result).toHaveLength(1);
            expect(result[0].orderId).toBe(7);
        });

        it('should return empty array when no details for order', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByOrderId(999);
            expect(result).toEqual([]);
        });
    });

    describe('findByProductId', () => {
        it('should return order details for a product', async () => {
            const mockResults = [
                { order_detail_id: 2, order_id: 1, product_id: 8, quantity: 2, unit_price: 4.99, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByProductId(8);
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_details WHERE product_id = ? ORDER BY order_detail_id',
                [8]
            );
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe(8);
        });
    });

    describe('getTotalValueByOrderId', () => {
        it('should return total value for an order', async () => {
            mockDb.get.mockResolvedValue({ total: 49.95 });
            const result = await repository.getTotalValueByOrderId(1);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT SUM(quantity * unit_price) as total FROM order_details WHERE order_id = ?',
                [1]
            );
            expect(result).toBe(49.95);
        });

        it('should return 0 when no details for order', async () => {
            mockDb.get.mockResolvedValue({ total: null });
            const result = await repository.getTotalValueByOrderId(999);
            expect(result).toBe(0);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.getTotalValueByOrderId(1)).rejects.toThrow();
        });
    });

    describe('findByOrderId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByOrderId(1)).rejects.toThrow();
        });
    });

    describe('findByProductId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByProductId(1)).rejects.toThrow();
        });
    });
});
