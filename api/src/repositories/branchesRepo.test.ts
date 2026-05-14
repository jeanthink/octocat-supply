import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchesRepository } from './branchesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('BranchesRepository', () => {
    let repository: BranchesRepository;
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
        repository = new BranchesRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all branches', async () => {
            const mockResults = [
                { branch_id: 1, headquarters_id: 1, name: 'Branch A', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].branchId).toBe(1);
        });

        it('should return empty array when no branches exist', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findAll();
            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return branch when found', async () => {
            mockDb.get.mockResolvedValue({ branch_id: 1, headquarters_id: 2, name: 'Test Branch', description: '', address: '', contact_person: '', email: '', phone: '' });
            const result = await repository.findById(1);
            expect(result?.branchId).toBe(1);
        });

        it('should return null when branch not found', async () => {
            mockDb.get.mockResolvedValue(undefined);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new branch and return it', async () => {
            const newBranch = { headquartersId: 1, name: 'New Branch', description: '', address: '', contactPerson: '', email: '', phone: '' };
            mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
            mockDb.get.mockResolvedValue({ branch_id: 3, headquarters_id: 1, name: 'New Branch', description: '', address: '', contact_person: '', email: '', phone: '' });
            const result = await repository.create(newBranch);
            expect(result.branchId).toBe(3);
        });

        it('should throw when created branch cannot be retrieved', async () => {
            const newBranch = { headquartersId: 1, name: 'New Branch', description: '', address: '', contactPerson: '', email: '', phone: '' };
            mockDb.run.mockResolvedValue({ lastID: 0, changes: 1 });
            mockDb.get.mockResolvedValue(undefined);
            await expect(repository.create(newBranch)).rejects.toThrow('Failed to retrieve created branch');
        });
    });

    describe('update', () => {
        it('should update branch and return updated data', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({ branch_id: 1, headquarters_id: 1, name: 'Updated Branch', description: '', address: '', contact_person: '', email: '', phone: '' });
            const result = await repository.update(1, { name: 'Updated Branch' });
            expect(result.name).toBe('Updated Branch');
        });

        it('should throw NotFoundError when branch does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
        });

        it('should throw when updated branch cannot be retrieved', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue(undefined);
            await expect(repository.update(1, { name: 'X' })).rejects.toThrow('Failed to retrieve updated branch');
        });
    });

    describe('delete', () => {
        it('should delete existing branch', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });
            await repository.delete(1);
            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM branches WHERE branch_id = ?', [1]);
        });

        it('should throw NotFoundError when branch does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });
            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when branch exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = await repository.exists(1);
            expect(result).toBe(true);
        });

        it('should return false when branch does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = await repository.exists(999);
            expect(result).toBe(false);
        });

        it('should throw when database error occurs', async () => {
            mockDb.get.mockRejectedValue(new Error('DB error'));
            await expect(repository.exists(1)).rejects.toThrow();
        });
    });

    describe('findByHeadquartersId', () => {
        it('should return branches for a headquarters', async () => {
            const mockResults = [
                { branch_id: 1, headquarters_id: 2, name: 'Branch A', description: '', address: '', contact_person: '', email: '', phone: '' },
                { branch_id: 2, headquarters_id: 2, name: 'Branch B', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByHeadquartersId(2);
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name', [2]);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no branches for headquarters', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByHeadquartersId(999);
            expect(result).toEqual([]);
        });
    });

    describe('findByName', () => {
        it('should return branches matching name pattern', async () => {
            const mockResults = [
                { branch_id: 1, headquarters_id: 1, name: 'North Branch', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = await repository.findByName('North');
            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM branches WHERE name LIKE ? ORDER BY name', ['%North%']);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('North Branch');
        });

        it('should return empty array when no branches match', async () => {
            mockDb.all.mockResolvedValue([]);
            const result = await repository.findByName('NonExistent');
            expect(result).toEqual([]);
        });

        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByName('Test')).rejects.toThrow();
        });
    });

    describe('findByHeadquartersId - error case', () => {
        it('should throw when database error occurs', async () => {
            mockDb.all.mockRejectedValue(new Error('DB error'));
            await expect(repository.findByHeadquartersId(1)).rejects.toThrow();
        });
    });
});
