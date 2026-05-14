import { describe, it, expect } from 'vitest';
import type { Supplier } from './supplier';

describe('Supplier model', () => {
  it('should create a valid supplier object with all fields', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'OctoSupplies Ltd',
      description: 'Premium supply company',
      contactPerson: 'Bob Johnson',
      email: 'bob@octosupplies.com',
      phone: '555-2001',
      active: true,
      verified: true,
    };

    expect(supplier.supplierId).toBe(1);
    expect(supplier.name).toBe('OctoSupplies Ltd');
    expect(supplier.description).toBe('Premium supply company');
    expect(supplier.contactPerson).toBe('Bob Johnson');
    expect(supplier.email).toBe('bob@octosupplies.com');
    expect(supplier.phone).toBe('555-2001');
    expect(supplier.active).toBe(true);
    expect(supplier.verified).toBe(true);
  });

  it('should support inactive and unverified supplier', () => {
    const supplier: Supplier = {
      supplierId: 2,
      name: 'New Supplier',
      description: '',
      contactPerson: '',
      email: '',
      phone: '',
      active: false,
      verified: false,
    };

    expect(supplier.active).toBe(false);
    expect(supplier.verified).toBe(false);
  });

  it('should have numeric supplierId', () => {
    const supplier: Supplier = {
      supplierId: 99,
      name: 'Numeric Test',
      description: '',
      contactPerson: '',
      email: '',
      phone: '',
      active: true,
      verified: false,
    };

    expect(typeof supplier.supplierId).toBe('number');
  });

  it('should have boolean active and verified fields', () => {
    const activeSupplier: Supplier = {
      supplierId: 1,
      name: 'Active',
      description: '',
      contactPerson: '',
      email: '',
      phone: '',
      active: true,
      verified: true,
    };

    expect(typeof activeSupplier.active).toBe('boolean');
    expect(typeof activeSupplier.verified).toBe('boolean');
  });
});
