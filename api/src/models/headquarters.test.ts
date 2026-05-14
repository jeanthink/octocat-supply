import { describe, it, expect } from 'vitest';
import type { Headquarters } from './headquarters';

describe('Headquarters model', () => {
  it('should create a valid headquarters object with all fields', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'Global HQ',
      description: 'Main global headquarters',
      address: '1 Corporate Blvd',
      contactPerson: 'CEO',
      email: 'ceo@company.com',
      phone: '555-0001',
      city: 'New York',
      country: 'USA',
      floorCount: 20,
      capacity: 500,
    };

    expect(hq.headquartersId).toBe(1);
    expect(hq.name).toBe('Global HQ');
    expect(hq.description).toBe('Main global headquarters');
    expect(hq.address).toBe('1 Corporate Blvd');
    expect(hq.contactPerson).toBe('CEO');
    expect(hq.email).toBe('ceo@company.com');
    expect(hq.phone).toBe('555-0001');
    expect(hq.city).toBe('New York');
    expect(hq.country).toBe('USA');
    expect(hq.floorCount).toBe(20);
    expect(hq.capacity).toBe(500);
  });

  it('should create a headquarters without optional fields', () => {
    const hq: Headquarters = {
      headquartersId: 2,
      name: 'Minimal HQ',
      description: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
    };

    expect(hq.headquartersId).toBe(2);
    expect(hq.city).toBeUndefined();
    expect(hq.country).toBeUndefined();
    expect(hq.floorCount).toBeUndefined();
    expect(hq.capacity).toBeUndefined();
  });

  it('should have numeric headquartersId, floorCount, and capacity', () => {
    const hq: Headquarters = {
      headquartersId: 10,
      name: 'Numeric Test HQ',
      description: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      floorCount: 5,
      capacity: 200,
    };

    expect(typeof hq.headquartersId).toBe('number');
    expect(typeof hq.floorCount).toBe('number');
    expect(typeof hq.capacity).toBe('number');
  });

  it('should have string name and contact information', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'String Test HQ',
      description: 'A description',
      address: '1 Street',
      contactPerson: 'John',
      email: 'john@hq.com',
      phone: '555-9999',
    };

    expect(typeof hq.name).toBe('string');
    expect(typeof hq.address).toBe('string');
    expect(typeof hq.email).toBe('string');
  });
});
