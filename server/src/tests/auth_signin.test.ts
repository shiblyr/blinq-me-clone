import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type SignupInput, type SigninInput } from '../schema';
import { signup } from '../handlers/auth/signup';
import { signin } from '../handlers/auth/signin';

const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('signin', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should sign in user with correct credentials', async () => {
    // Create user first
    await signup(testUser);

    // Sign in with correct credentials
    const signinInput: SigninInput = {
      email: testUser.email,
      password: testUser.password
    };

    const result = await signin(signinInput);

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('should reject signin with incorrect email', async () => {
    // Create user first
    await signup(testUser);

    // Try to sign in with wrong email
    const signinInput: SigninInput = {
      email: 'wrong@example.com',
      password: testUser.password
    };

    await expect(signin(signinInput)).rejects.toThrow(/invalid email or password/i);
  });

  it('should reject signin with incorrect password', async () => {
    // Create user first
    await signup(testUser);

    // Try to sign in with wrong password
    const signinInput: SigninInput = {
      email: testUser.email,
      password: 'wrongpassword'
    };

    await expect(signin(signinInput)).rejects.toThrow(/invalid email or password/i);
  });

  it('should generate valid token format', async () => {
    // Create user first
    await signup(testUser);

    const signinInput: SigninInput = {
      email: testUser.email,
      password: testUser.password
    };

    const result = await signin(signinInput);

    // Token should be base64 encoded JSON
    expect(() => {
      const decoded = Buffer.from(result.token, 'base64').toString('utf-8');
      const payload = JSON.parse(decoded);
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('exp');
      expect(typeof payload.userId).toBe('number');
      expect(typeof payload.email).toBe('string');
      expect(typeof payload.exp).toBe('number');
    }).not.toThrow();
  });
});