import { describe, it, expect } from 'vitest';
import '../setup.js';
import User from '../../src/modules/users/user.model.js';

describe('User Model', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'PATIENT',
  };

  describe('valid creation', () => {
    it('creates a user with valid data', async () => {
      const user = await User.create(validUserData);
      expect(user._id).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('PATIENT');
      expect(user.isActive).toBe(true);
      expect(user.preferredLanguage).toBe('en');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('creates users with all valid roles', async () => {
      const roles = ['PATIENT', 'CAREGIVER', 'ADMIN', 'HOST'];
      for (let i = 0; i < roles.length; i++) {
        const user = await User.create({
          name: `User ${roles[i]}`,
          email: `user-${roles[i].toLowerCase()}@example.com`,
          role: roles[i],
        });
        expect(user.role).toBe(roles[i]);
      }
    });
  });

  describe('required fields', () => {
    it('rejects user without name', async () => {
      await expect(User.create({ email: 'no-name@example.com', role: 'PATIENT' })).rejects.toThrow(
        'Name is required'
      );
    });

    it('rejects user without email', async () => {
      await expect(User.create({ name: 'No Email', role: 'PATIENT' })).rejects.toThrow(
        'Email is required'
      );
    });

    it('rejects user without role', async () => {
      await expect(User.create({ name: 'No Role', email: 'no-role@example.com' })).rejects.toThrow(
        'Role is required'
      );
    });
  });

  describe('invalid role', () => {
    it('rejects an invalid role value', async () => {
      await expect(
        User.create({
          name: 'Bad Role',
          email: 'bad-role@example.com',
          role: 'SUPERADMIN',
        })
      ).rejects.toThrow('is not a valid role');
    });
  });

  describe('email normalization', () => {
    it('lowercases email', async () => {
      const user = await User.create({
        name: 'Case Test',
        email: 'TeSt@EXAMPLE.COM',
        role: 'PATIENT',
      });
      expect(user.email).toBe('test@example.com');
    });

    it('trims email', async () => {
      const user = await User.create({
        name: 'Trim Test',
        email: '  spaced@example.com  ',
        role: 'PATIENT',
      });
      expect(user.email).toBe('spaced@example.com');
    });
  });

  describe('duplicate email', () => {
    it('rejects duplicate email', async () => {
      await User.create(validUserData);
      await expect(User.create({ ...validUserData, name: 'Duplicate' })).rejects.toThrow();
    });
  });

  describe('passwordHash security', () => {
    it('does not include passwordHash in default queries', async () => {
      await User.create({ ...validUserData, passwordHash: 'hashed_value' });
      const user = await User.findOne({ email: validUserData.email });
      expect(user.passwordHash).toBeUndefined();
    });

    it('includes passwordHash when explicitly selected', async () => {
      await User.create({ ...validUserData, passwordHash: 'hashed_value' });
      const user = await User.findOne({ email: validUserData.email }).select('+passwordHash');
      expect(user.passwordHash).toBe('hashed_value');
    });
  });
});
