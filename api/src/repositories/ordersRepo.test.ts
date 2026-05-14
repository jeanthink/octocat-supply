import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersRepository } from './ordersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('OrdersRepository', () => {
    let repository: OrdersRepository;
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
        repository = new OrdersRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all orders', async () => {
            const mockResults = [
                { order_id: 1, branch_id: 1, order_date: '2025-01-01', name: 'Order A', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].orderId).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return order when found', async () => {
            mockDb.get.mockResolvedValue({ order_id: 1, branch_id: 1, order_date: '2025-01-01', name: 'Order A', description: '', status: 'pending' });
            const result = await repository.findById(1);
            expect(result?.orderId).toBe(1);
        });

        it('should return null when order not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new order and return it', async () => {
            const newOrder = { branchId: 1, orderDate: '2025-02-01', name: 'New Order', description: '', status: 'pending' };
            mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
            mockDb.get.mockResolvedValue({ order_id: 2, branch_id: 1, order_date: '2025-02-01', name: 'New Order', description: '', status: 'pending' });
            const result = await repository.create(newOrder);
            expect(result.orderId).toBe(2);
        });

        it('should throw when created order cannot be retrieved', async () => {
            const newOrder = { branchId: 1, orderDate: '2025-02-01', name: 'New Order', description: '', status: 'pending' };
            mockDb.run.mockResolvedValue({ lastID: 0, changes: 1 });
            mockDb.get.mockResolvedValue(undefined);
            await expect(repository.create(newOrder)).rejects.toThrow('Failed to retrieve created order');
        });
    });

    describe('update', () => {
        it('should update order and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ order_id: 1, branch_id: 1, order_date: '2025-01-01', name: 'Updated Order', description: '', status: 'processing' });
            const result = await repository.update(1, { name: 'Updated Order', status: 'processing' });
            expect(result.name).toBe('Updated Order');
        });

        it('should throw NotFoundError when order does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
        });

        it('should throw when updated order cannot be retrieved', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue(undefined);
            await expect(repository.update(1, { name: 'X' })).rejects.toThrow('Failed to retrieve updated order');
        });
    });

    describe('delete', () => {
        it('should delete existing order', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM orders WHERE order_id = ?', [1]);
        });

        it('should throw NotFoundError when order does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when order exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when order does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });

    describe('findByBranchId', () => {
        it('should return orders for a branch', async () => {
            const mockResults = [
                { order_id: 1, branch_id: 3, order_date: '2025-03-01', name: 'Order X', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByBranchId(3);
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC', [3]);
            expect(result).toHaveLength(1);
            expect(result[0].branchId).toBe(3);
        });

        it('should return empty array when no orders for branch', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByBranchId(999);
            expect(result).toEqual([]);
        });
    });

    describe('findByStatus', () => {
        it('should return orders with given status', async () => {
            const mockResults = [
                { order_id: 2, branch_id: 1, order_date: '2025-04-01', name: 'Pending Order', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByStatus('pending');
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC', ['pending']);
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('pending');
        });
    });

    describe('findByDateRange', () => {
        it('should return orders within date range', async () => {
            const mockResults = [
                { order_id: 3, branch_id: 1, order_date: '2025-05-15', name: 'May Order', description: '', status: 'processing' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByDateRange('2025-05-01', '2025-05-31');
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
                ['2025-05-01', '2025-05-31']
            );
            expect(result).toHaveLength(1);
        });

        it('should return empty array for date range with no orders', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByDateRange('2099-01-01', '2099-12-31');
            expect(result).toEqual([]);
        });

        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByDateRange('2025-01-01', '2025-12-31')).rejects.toThrow();
        });
    });

    describe('findByBranchId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByBranchId(1)).rejects.toThrow();
        });
    });

    describe('findByStatus - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByStatus('pending')).rejects.toThrow();
        });
    });
});
