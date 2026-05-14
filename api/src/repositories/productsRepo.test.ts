import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from './productsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('ProductsRepository', () => {
    let repository: ProductsRepository;
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
        repository = new ProductsRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all products', async () => {
            const mockResults = [
                { product_id: 1, supplier_id: 1, name: 'Widget', description: '', price: 9.99, sku: 'W-001', unit: 'piece', img_name: '', discount: 0 }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return product when found', async () => {
            mockDb.get.mockResolvedValue({ product_id: 1, supplier_id: 1, name: 'Widget', description: '', price: 9.99, sku: 'W-001', unit: 'piece', img_name: '', discount: 0 });
            const result = await repository.findById(1);
            expect(result?.productId).toBe(1);
        });

        it('should return null when product not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new product and return it', async () => {
            const newProduct = { supplierId: 1, name: 'New Widget', description: '', price: 14.99, sku: 'NW-001', unit: 'piece', imgName: '' };
            mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
            mockDb.get.mockResolvedValue({ product_id: 3, supplier_id: 1, name: 'New Widget', description: '', price: 14.99, sku: 'NW-001', unit: 'piece', img_name: '', discount: 0 });
            const result = await repository.create(newProduct);
            expect(result.productId).toBe(3);
        });
    });

    describe('update', () => {
        it('should update product and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ product_id: 1, supplier_id: 1, name: 'Updated Widget', description: '', price: 19.99, sku: 'W-001', unit: 'piece', img_name: '', discount: 0 });
            const result = await repository.update(1, { name: 'Updated Widget', price: 19.99 });
            expect(result.name).toBe('Updated Widget');
            expect(result.price).toBe(19.99);
        });

        it('should throw NotFoundError when product does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete existing product', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM products WHERE product_id = ?', [1]);
        });

        it('should throw NotFoundError when product does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when product exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when product does not exist', async () => {
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
        it('should return products for a supplier', async () => {
            const mockResults = [
                { product_id: 1, supplier_id: 3, name: 'Sup Product', description: '', price: 5.99, sku: 'SP-001', unit: 'piece', img_name: '', discount: 0 }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findBySupplierId(3);
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM products WHERE supplier_id = ? ORDER BY name', [3]);
            expect(result).toHaveLength(1);
            expect(result[0].supplierId).toBe(3);
        });
    });

    describe('findByName', () => {
        it('should return products matching name pattern', async () => {
            const mockResults = [
                { product_id: 1, supplier_id: 1, name: 'Blue Widget', description: '', price: 9.99, sku: 'BW-001', unit: 'piece', img_name: '', discount: 0 }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByName('Widget');
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Blue Widget');
        });
    });
});
