import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveriesRepository } from './deliveriesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('DeliveriesRepository', () => {
    let repository: DeliveriesRepository;
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
        repository = new DeliveriesRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all deliveries', async () => {
            const mockResults = [
                { delivery_id: 1, supplier_id: 1, delivery_date: '2025-01-01', name: 'Delivery A', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].deliveryId).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return delivery when found', async () => {
            mockDb.get.mockResolvedValue({ delivery_id: 1, supplier_id: 1, delivery_date: '2025-01-01', name: 'Delivery A', description: '', status: 'pending' });
            const result = await repository.findById(1);
            expect(result?.deliveryId).toBe(1);
        });

        it('should return null when delivery not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new delivery and return it', async () => {
            const newDelivery = { supplierId: 1, deliveryDate: '2025-02-01', name: 'New Delivery', description: '', status: 'pending' };
            mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
            mockDb.get.mockResolvedValue({ delivery_id: 2, supplier_id: 1, delivery_date: '2025-02-01', name: 'New Delivery', description: '', status: 'pending' });
            const result = await repository.create(newDelivery);
            expect(result.deliveryId).toBe(2);
        });
    });

    describe('update', () => {
        it('should update delivery and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ delivery_id: 1, supplier_id: 1, delivery_date: '2025-01-01', name: 'Updated', description: '', status: 'in-transit' });
            const result = await repository.update(1, { status: 'in-transit' });
            expect(result.status).toBe('in-transit');
        });

        it('should throw NotFoundError when delivery does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { status: 'x' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete existing delivery', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM deliveries WHERE delivery_id = ?', [1]);
        });

        it('should throw NotFoundError when delivery does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when delivery exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when delivery does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });

    describe('findBySupplierId', () => {
        it('should return deliveries for a supplier', async () => {
            const mockResults = [
                { delivery_id: 1, supplier_id: 5, delivery_date: '2025-06-01', name: 'Sup Delivery', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findBySupplierId(5);
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE supplier_id = ? ORDER BY delivery_date DESC',
                [5]
            );
            expect(result).toHaveLength(1);
            expect(result[0].supplierId).toBe(5);
        });

        it('should return empty array when no deliveries for supplier', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findBySupplierId(999);
            expect(result).toEqual([]);
        });
    });

    describe('findByStatus', () => {
        it('should return deliveries with given status', async () => {
            const mockResults = [
                { delivery_id: 2, supplier_id: 1, delivery_date: '2025-07-01', name: 'In Transit', description: '', status: 'in-transit' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByStatus('in-transit');
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE status = ? ORDER BY delivery_date DESC',
                ['in-transit']
            );
            expect(result[0].status).toBe('in-transit');
        });
    });

    describe('findByDateRange', () => {
        it('should return deliveries within date range', async () => {
            const mockResults = [
                { delivery_id: 3, supplier_id: 1, delivery_date: '2025-08-15', name: 'Aug Delivery', description: '', status: 'delivered' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByDateRange('2025-08-01', '2025-08-31');
            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE delivery_date >= ? AND delivery_date <= ? ORDER BY delivery_date DESC',
                ['2025-08-01', '2025-08-31']
            );
            expect(result).toHaveLength(1);
        });
    });

    describe('findByDateRange - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByDateRange('2025-01-01', '2025-12-31')).rejects.toThrow();
        });
    });

    describe('findBySupplierId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findBySupplierId(1)).rejects.toThrow();
        });
    });

    describe('findByStatus - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByStatus('pending')).rejects.toThrow();
        });
    });

    describe('updateStatus', () => {
        it('should update delivery status', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ delivery_id: 1, supplier_id: 1, delivery_date: '2025-01-01', name: 'Delivery', description: '', status: 'delivered' });
            const result = await repository.updateStatus(1, 'delivered');
            expect(result.status).toBe('delivered');
        });

        it('should throw NotFoundError when delivery does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.updateStatus(999, 'delivered')).rejects.toThrow(NotFoundError);
        });
    });
});
