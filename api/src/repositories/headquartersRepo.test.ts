import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeadquartersRepository } from './headquartersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('HeadquartersRepository', () => {
    let repository: HeadquartersRepository;
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
        repository = new HeadquartersRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all headquarters', async () => {
            const mockResults = [
                { headquarters_id: 1, name: 'HQ Alpha', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].headquartersId).toBe(1);
        });

        it('should return empty array when no headquarters exist', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findAll();
            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return headquarters when found', async () => {
            mockDb.get.mockResolvedValue({ headquarters_id: 1, name: 'HQ Alpha', description: '', address: '', contact_person: '', email: '', phone: '' });
            const result = await repository.findById(1);
            expect(result?.headquartersId).toBe(1);
        });

        it('should return null when headquarters not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new headquarters and return it', async () => {
            const newHQ = { name: 'New HQ', description: '', address: '1 Main St', contactPerson: '', email: '', phone: '' };
            mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
            mockDb.get.mockResolvedValue({ headquarters_id: 2, name: 'New HQ', description: '', address: '1 Main St', contact_person: '', email: '', phone: '' });
            const result = await repository.create(newHQ);
            expect(result.headquartersId).toBe(2);
            expect(result.name).toBe('New HQ');
        });
    });

    describe('update', () => {
        it('should update headquarters and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ headquarters_id: 1, name: 'Updated HQ', description: '', address: '', contact_person: '', email: '', phone: '' });
            const result = await repository.update(1, { name: 'Updated HQ' });
            expect(result.name).toBe('Updated HQ');
        });

        it('should throw NotFoundError when headquarters does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete existing headquarters', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM headquarters WHERE headquarters_id = ?', [1]);
        });

        it('should throw NotFoundError when headquarters does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when headquarters exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM headquarters WHERE headquarters_id = ?', [1]);
        });

        it('should return false when headquarters does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });
    });

    describe('findByName', () => {
        it('should return headquarters matching name pattern', async () => {
            const mockResults = [
                { headquarters_id: 1, name: 'Global HQ', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByName('Global');
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name', ['%Global%']);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Global HQ');
        });

        it('should return empty array when no headquarters match', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByName('NonExistent');
            expect(result).toEqual([]);
        });

        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByName('Test')).rejects.toThrow();
        });
    });

    describe('exists - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });
});
