import { describe, it, expect } from 'vitest';
import {
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
  mapDatabaseRows,
  generatePlaceholders,
  buildInsertSQL,
  buildUpdateSQL,
  validateRequiredFields,
  SelectQueryBuilder,
} from './sql';

describe('SQL utilities', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('supplierId')).toBe('supplier_id');
      expect(toSnakeCase('orderDetailId')).toBe('order_detail_id');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnakeCase('name')).toBe('name');
      expect(toSnakeCase('email')).toBe('email');
    });

    it('should handle multiple uppercase letters', () => {
      expect(toSnakeCase('branchId')).toBe('branch_id');
      expect(toSnakeCase('headquartersId')).toBe('headquarters_id');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('supplier_id')).toBe('supplierId');
      expect(toCamelCase('order_detail_id')).toBe('orderDetailId');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('name')).toBe('name');
      expect(toCamelCase('email')).toBe('email');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe', supplierId: 1 };
      const result = objectToSnakeCase(input);
      expect(result).toEqual({ first_name: 'John', last_name: 'Doe', supplier_id: 1 });
    });

    it('should preserve values unchanged', () => {
      const input = { productName: 'Widget', price: 9.99, active: true };
      const result = objectToSnakeCase(input);
      expect(result.product_name).toBe('Widget');
      expect(result.price).toBe(9.99);
      expect(result.active).toBe(true);
    });
  });

  describe('objectToCamelCase', () => {
    it('should convert database row keys to camelCase', () => {
      const row = { first_name: 'Jane', last_name: 'Smith', supplier_id: 2 };
      const result = objectToCamelCase(row);
      expect(result).toEqual({ firstName: 'Jane', lastName: 'Smith', supplierId: 2 });
    });

    it('should preserve values', () => {
      const row = { product_name: 'Gear', unit_price: 14.99 };
      const result = objectToCamelCase(row) as Record<string, unknown>;
      expect(result.productName).toBe('Gear');
      expect(result.unitPrice).toBe(14.99);
    });
  });

  describe('mapDatabaseRows', () => {
    it('should convert multiple rows to camelCase objects', () => {
      const rows = [
        { supplier_id: 1, name: 'Supplier A' },
        { supplier_id: 2, name: 'Supplier B' },
      ];
      const result = mapDatabaseRows<{ supplierId: number; name: string }>(rows);
      expect(result).toHaveLength(2);
      expect(result[0].supplierId).toBe(1);
      expect(result[1].supplierId).toBe(2);
    });

    it('should return empty array for no rows', () => {
      const result = mapDatabaseRows([]);
      expect(result).toEqual([]);
    });
  });

  describe('generatePlaceholders', () => {
    it('should generate correct number of placeholders', () => {
      expect(generatePlaceholders(1)).toBe('?');
      expect(generatePlaceholders(3)).toBe('?, ?, ?');
      expect(generatePlaceholders(5)).toBe('?, ?, ?, ?, ?');
    });
  });

  describe('buildInsertSQL', () => {
    it('should build INSERT SQL with correct columns and placeholders', () => {
      const data = { name: 'Test', email: 'test@test.com' };
      const { sql, values } = buildInsertSQL('test_table', data);
      expect(sql).toBe('INSERT INTO test_table (name, email) VALUES (?, ?)');
      expect(values).toEqual(['Test', 'test@test.com']);
    });

    it('should convert camelCase keys to snake_case', () => {
      const data = { firstName: 'John', supplierId: 1 };
      const { sql, values } = buildInsertSQL('test_table', data);
      expect(sql).toContain('first_name');
      expect(sql).toContain('supplier_id');
      expect(values).toEqual(['John', 1]);
    });

    it('should convert boolean values to integers', () => {
      const data = { name: 'Test', active: true, verified: false };
      const { sql, values } = buildInsertSQL('suppliers', data);
      expect(values).toContain(1);
      expect(values).toContain(0);
      expect(values).not.toContain(true);
      expect(values).not.toContain(false);
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build UPDATE SQL with correct SET clauses', () => {
      const data = { name: 'Updated', email: 'new@test.com' };
      const { sql, values } = buildUpdateSQL('test_table', data, 'id = ?');
      expect(sql).toBe('UPDATE test_table SET name = ?, email = ? WHERE id = ?');
      expect(values).toEqual(['Updated', 'new@test.com']);
    });

    it('should convert camelCase keys to snake_case', () => {
      const data = { contactPerson: 'Alice', supplierId: 3 };
      const { sql, values } = buildUpdateSQL('test_table', data, 'id = ?');
      expect(sql).toContain('contact_person');
      expect(sql).toContain('supplier_id');
      expect(values).toEqual(['Alice', 3]);
    });

    it('should convert boolean values to integers', () => {
      const data = { active: true, verified: false };
      const { sql, values } = buildUpdateSQL('suppliers', data, 'supplier_id = ?');
      expect(values).toContain(1);
      expect(values).toContain(0);
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw when all required fields are present', () => {
      const obj = { name: 'Test', email: 'test@test.com', id: 1 };
      expect(() => validateRequiredFields(obj, ['name', 'email', 'id'])).not.toThrow();
    });

    it('should throw when a required field is missing', () => {
      const obj = { name: 'Test', email: '' };
      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow("Required field 'email' is missing or empty");
    });

    it('should throw when a required field is undefined', () => {
      const obj = { name: 'Test' } as Record<string, unknown>;
      expect(() => validateRequiredFields(obj, ['name', 'phone'])).toThrow("Required field 'phone' is missing or empty");
    });

    it('should throw when a required field is null', () => {
      const obj = { name: null, email: 'test@test.com' } as Record<string, unknown>;
      expect(() => validateRequiredFields(obj, ['name'])).toThrow("Required field 'name' is missing or empty");
    });
  });

  describe('SelectQueryBuilder', () => {
    it('should build a basic SELECT * query', () => {
      const qb = new SelectQueryBuilder('products');
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products');
    });

    it('should build query with specific columns', () => {
      const qb = new SelectQueryBuilder('products');
      qb.select(['name', 'price']);
      const sql = qb.build();
      expect(sql).toBe('SELECT name, price FROM products');
    });

    it('should build query with WHERE condition', () => {
      const qb = new SelectQueryBuilder('products');
      qb.where('price > 10');
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products WHERE price > 10');
    });

    it('should build query with multiple WHERE conditions', () => {
      const qb = new SelectQueryBuilder('products');
      qb.where('price > 10');
      qb.where('active = 1');
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products WHERE price > 10 AND active = 1');
    });

    it('should build query with ORDER BY clause', () => {
      const qb = new SelectQueryBuilder('products');
      qb.orderBy('name');
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products ORDER BY name ASC');
    });

    it('should build query with ORDER BY DESC', () => {
      const qb = new SelectQueryBuilder('products');
      qb.orderBy('created_at', 'DESC');
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products ORDER BY created_at DESC');
    });

    it('should build query with LIMIT', () => {
      const qb = new SelectQueryBuilder('products');
      qb.limit(10);
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products LIMIT 10');
    });

    it('should build query with OFFSET', () => {
      const qb = new SelectQueryBuilder('products');
      qb.limit(10);
      qb.offset(20);
      const sql = qb.build();
      expect(sql).toBe('SELECT * FROM products LIMIT 10 OFFSET 20');
    });

    it('should build query with JOIN', () => {
      const qb = new SelectQueryBuilder('products');
      qb.join('suppliers', 'products.supplier_id = suppliers.supplier_id');
      const sql = qb.build();
      expect(sql).toContain('INNER JOIN suppliers ON products.supplier_id = suppliers.supplier_id');
    });

    it('should build query with LEFT JOIN', () => {
      const qb = new SelectQueryBuilder('orders');
      qb.join('branches', 'orders.branch_id = branches.branch_id', 'LEFT');
      const sql = qb.build();
      expect(sql).toContain('LEFT JOIN branches ON orders.branch_id = branches.branch_id');
    });

    it('should build complex query with all clauses', () => {
      const qb = new SelectQueryBuilder('products');
      qb.select(['p.name', 'p.price']);
      qb.join('suppliers s', 'p.supplier_id = s.supplier_id', 'LEFT');
      qb.where('p.price > 5');
      qb.orderBy('p.name', 'ASC');
      qb.limit(20);
      qb.offset(0);
      const sql = qb.build();
      expect(sql).toContain('SELECT p.name, p.price');
      expect(sql).toContain('FROM products');
      expect(sql).toContain('LEFT JOIN');
      expect(sql).toContain('WHERE p.price > 5');
      expect(sql).toContain('ORDER BY p.name ASC');
      expect(sql).toContain('LIMIT 20');
      expect(sql).toContain('OFFSET 0');
    });

    it('should support method chaining', () => {
      const sql = new SelectQueryBuilder('orders')
        .where('status = ?')
        .orderBy('order_date', 'DESC')
        .limit(5)
        .build();
      expect(sql).toBe("SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC LIMIT 5");
    });
  });
});
