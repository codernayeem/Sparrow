import jwt from 'jsonwebtoken';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';

// Mock JWT
jest.mock('jsonwebtoken');

describe('generateTokenAndSetCookie', () => {
  let mockResponse;
  
  beforeEach(() => {
    mockResponse = {
      cookie: jest.fn()
    };
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'development';
  });

  test('should generate token and set cookie', () => {
    const mockToken = 'mock-jwt-token';
    jwt.sign.mockReturnValue(mockToken);
    
    const userId = '123';
    generateTokenAndSetCookie(userId, mockResponse);
    
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId },
      'test-secret',
      { expiresIn: '15d' }
    );
    
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'jwt',
      mockToken,
      expect.objectContaining({
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: false
      })
    );
  });
});