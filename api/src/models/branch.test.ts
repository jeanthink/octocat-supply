import { describe, it, expect } from 'vitest';
import type { Branch } from './branch';

describe('Branch model', () => {
  it('should create a valid branch object with all fields', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 2,
      name: 'North Branch',
      description: 'Northern district branch',
      address: '100 North Ave',
      contactPerson: 'Alice Smith',
      email: 'alice@north.com',
      phone: '555-0101',
    };

    expect(branch.branchId).toBe(1);
    expect(branch.headquartersId).toBe(2);
    expect(branch.name).toBe('North Branch');
    expect(branch.description).toBe('Northern district branch');
    expect(branch.address).toBe('100 North Ave');
    expect(branch.contactPerson).toBe('Alice Smith');
    expect(branch.email).toBe('alice@north.com');
    expect(branch.phone).toBe('555-0101');
  });

  it('should accept a branch with required fields only', () => {
    const branch: Branch = {
      branchId: 5,
      headquartersId: 1,
      name: 'Minimal Branch',
      description: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
    };

    expect(branch.branchId).toBe(5);
    expect(branch.name).toBe('Minimal Branch');
  });

  it('should have numeric branchId and headquartersId', () => {
    const branch: Branch = {
      branchId: 42,
      headquartersId: 7,
      name: 'Test',
      description: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
    };

    expect(typeof branch.branchId).toBe('number');
    expect(typeof branch.headquartersId).toBe('number');
  });

  it('should have string fields for contact information', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'Contact Branch',
      description: 'A branch',
      address: '1 Street',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
    };

    expect(typeof branch.name).toBe('string');
    expect(typeof branch.email).toBe('string');
    expect(typeof branch.phone).toBe('string');
    expect(typeof branch.contactPerson).toBe('string');
  });
});
